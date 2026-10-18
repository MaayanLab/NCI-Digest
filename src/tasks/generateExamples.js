// Queue the landing-page example explainers into a public collection.
// Usage: npm run examples -- --owner you@example.org [--only ex-nlst-2011,...] [--pdf-dir ./pdfs] [--regenerate]
// The worker (npm run worker) does the generation; landing cards switch to the item once it completes.
import fs from "fs"
import path from "path"
import { parseArgs } from "util"
import { db } from "../lib/database/index.js"
import { DEFAULT_MODEL } from "../lib/signals/store.js"
import { EXAMPLES_COLLECTION, EXAMPLE_ASSETS } from "../lib/exampleAssets.js"
import { queue_generate_signal_item } from "./generateSignalItem.js"

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

function decode(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

async function pubmedRecord(pmid) {
  const params = new URLSearchParams({ db: "pubmed", id: pmid, retmode: "xml", tool: "nci-signal" })
  if (process.env.NCBI_API_KEY) params.set("api_key", process.env.NCBI_API_KEY)
  let res
  for (let attempt = 0; attempt < 4; attempt += 1) {
    res = await fetch(`${EUTILS}?${params}`)
    if (res.status !== 429) break
    await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)))
  }
  if (!res.ok) throw new Error(`PubMed efetch ${pmid} failed (${res.status})`)
  const xml = await res.text()
  const abstract = [...xml.matchAll(/<AbstractText([^>]*)>([\s\S]*?)<\/AbstractText>/g)]
    .map(([, attrs, body]) => {
      const label = attrs.match(/Label="([^"]+)"/)?.[1]
      return label ? `${label}: ${decode(body)}` : decode(body)
    })
    .join("\n")
  const journal = decode(xml.match(/<Journal>[\s\S]*?<Title>([\s\S]*?)<\/Title>/)?.[1] || "")
  const grants = [...xml.matchAll(/<GrantID>([^<]+)<\/GrantID>/g)]
    .map(([, id]) => id.trim())
    .filter((id) => /CA\s*-?\d/i.test(id))
  return { abstract, journal, nci_grants: [...new Set(grants)].slice(0, 20) }
}

async function ownerFor(email) {
  const user = await db.selectFrom("app.users").select(["id", "email"]).where("email", "=", email).executeTakeFirst()
  if (!user) throw new Error(`No user ${email}. Sign in to the site once with that account, then rerun.`)
  return user
}

async function examplesCollection(ownerId) {
  const existing = await db
    .selectFrom("app.signals")
    .selectAll()
    .where("slug", "=", EXAMPLES_COLLECTION.slug)
    .executeTakeFirst()
  if (existing) return existing
  return await db
    .insertInto("app.signals")
    .values({
      owner_id: ownerId,
      slug: EXAMPLES_COLLECTION.slug,
      title: EXAMPLES_COLLECTION.title,
      description: EXAMPLES_COLLECTION.description,
      medium: "podcast",
      model: DEFAULT_MODEL,
      structure_prompt: "",
      criteria: JSON.stringify({ require_nci: true }),
      visibility: "public",
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

function localPdf(dir, asset) {
  if (!dir) return ""
  const file = path.resolve(dir, `${asset.id}.pdf`)
  if (!fs.existsSync(file)) return ""
  const buffer = fs.readFileSync(file)
  if (buffer.subarray(0, 4).toString() !== "%PDF") throw new Error(`${file} is not a PDF`)
  return buffer.toString("base64")
}

async function main() {
  const { values } = parseArgs({
    options: {
      owner: { type: "string", default: process.env.EXAMPLES_OWNER_EMAIL || "" },
      only: { type: "string", default: "" },
      "pdf-dir": { type: "string", default: "" },
      regenerate: { type: "boolean", default: false },
    },
  })
  if (!values.owner) throw new Error("Pass --owner <email> (the account that will own the examples collection)")

  const only = new Set(values.only.split(",").map((s) => s.trim()).filter(Boolean))
  const assets = EXAMPLE_ASSETS.filter((asset) => !only.size || only.has(asset.id))
  if (!assets.length) throw new Error(`No examples match --only ${values.only}`)

  const owner = await ownerFor(values.owner)
  const signal = await examplesCollection(owner.id)
  console.log(`Collection /signals/${signal.slug} (owner ${owner.email})`)

  for (const asset of assets) {
    const existing = await db
      .selectFrom("app.signal_items")
      .select(["id", "status"])
      .where("signal_id", "=", signal.id)
      .where("pmid", "=", asset.pmid)
      .where("medium", "=", asset.medium)
      .where("status", "!=", "failed")
      .execute()
    if (existing.length && !values.regenerate) {
      console.log(`skip  ${asset.id}: already ${existing[0].status} (use --regenerate to replace)`)
      continue
    }
    if (existing.length) {
      await db.deleteFrom("app.signal_items").where("id", "in", existing.map((row) => row.id)).execute()
    }

    const record = await pubmedRecord(asset.pmid)
    const pdf_base64 = localPdf(values["pdf-dir"], asset)
    const paper = {
      title: asset.paper_title,
      abstract: record.abstract,
      journal: record.journal,
      pmid: asset.pmid,
      doi: asset.doi,
      publication_url: asset.paper_url,
      nci_grants: record.nci_grants,
      outputs: asset.outputs,
    }
    if (!pdf_base64 && !paper.abstract) throw new Error(`${asset.id}: no PDF and no PubMed abstract`)

    const item = await db
      .insertInto("app.signal_items")
      .values({
        signal_id: signal.id,
        owner_id: signal.owner_id,
        status: "queued",
        medium: asset.medium,
        model: signal.model,
        source: pdf_base64 ? "upload" : "pubmed",
        pmid: asset.pmid,
        doi: asset.doi,
        journal: paper.journal || null,
        publication_url: asset.paper_url,
        paper_title: asset.paper_title,
        paper: JSON.stringify({
          ...paper,
          abstract: undefined,
          generation_log: "Queued. Waiting for a worker to pick up this job.\n",
        }),
      })
      .returning("id")
      .executeTakeFirstOrThrow()

    await queue_generate_signal_item({
      item_id: item.id,
      signal_slug: signal.slug,
      signal_title: signal.title,
      medium: asset.medium,
      model: signal.model,
      structure_prompt: signal.structure_prompt || "",
      paper,
      pdf_base64,
      oa_pdf_url: pdf_base64 ? "" : asset.pdf_url || "",
    })
    const source = pdf_base64 ? "local PDF" : asset.pdf_url ? "open-access PDF" : "abstract"
    console.log(`queue ${asset.id}: ${asset.medium} from ${source} -> /signals/${signal.slug}/items/${item.id}`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}

main()
  .then(() => {
    console.log("Done. Keep `npm run worker` running until the items finish.")
    process.exit(0)
  })
  .catch((err) => {
    console.error(err.message || err)
    process.exit(1)
  })
