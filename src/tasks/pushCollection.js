// Copy collections and their completed items from the local database to another one (e.g. production).
// Usage: npm run push-collection -- --to postgres://... --slug nci-landmark-papers [--slug other] [--dry-run]
// Media already lives in S3, so only rows move. Item ids are kept, so item links match across sites.
import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"
import { parseArgs } from "util"
import { db as local } from "../lib/database/index.js"

const JSON_COLUMNS = ["paper", "tags", "content"]

function asJson(row) {
  const out = { ...row }
  for (const key of JSON_COLUMNS) {
    if (key in out && out[key] !== null) out[key] = JSON.stringify(out[key])
  }
  return out
}

async function main() {
  const { values } = parseArgs({
    options: {
      to: { type: "string", default: process.env.PROD_DATABASE_URL || "" },
      slug: { type: "string", multiple: true, default: [] },
      "dry-run": { type: "boolean", default: false },
    },
  })
  if (!values.to) throw new Error("Pass --to <postgres url> (or set PROD_DATABASE_URL)")
  if (!values.slug.length) throw new Error("Pass at least one --slug")
  if (values.to === process.env.DATABASE_URL) throw new Error("--to is the same database as DATABASE_URL")

  const remote = new Kysely({ dialect: new PostgresDialect({ pool: new Pool({ connectionString: values.to }) }) })
  try {
    for (const slug of values.slug) {
      const signal = await local.selectFrom("app.signals").selectAll().where("slug", "=", slug).executeTakeFirst()
      if (!signal) throw new Error(`No local collection ${slug}`)
      const owner = await local.selectFrom("app.users").selectAll().where("id", "=", signal.owner_id).executeTakeFirstOrThrow()
      const items = await local
        .selectFrom("app.signal_items")
        .selectAll()
        .where("signal_id", "=", signal.id)
        .where("status", "=", "completed")
        .execute()
      console.log(`${slug}: ${items.length} completed item(s), owner ${owner.email}`)
      if (values["dry-run"]) continue

      await remote.transaction().execute(async (trx) => {
        const user = await trx
          .insertInto("app.users")
          .values({ email: owner.email, name: owner.name, avatar_url: owner.avatar_url, provider: owner.provider })
          .onConflict((oc) => oc.column("email").doUpdateSet((eb) => ({
            name: eb.fn.coalesce(eb.ref("app.users.name"), eb.ref("excluded.name")),
          })))
          .returning("id")
          .executeTakeFirstOrThrow()

        const fields = {
          title: signal.title,
          description: signal.description,
          medium: signal.medium,
          model: signal.model,
          structure_prompt: signal.structure_prompt,
          criteria: JSON.stringify(signal.criteria || {}),
          visibility: signal.visibility,
          updated_at: new Date(),
        }
        const target = await trx
          .insertInto("app.signals")
          .values({ ...fields, slug, owner_id: user.id, created_at: signal.created_at })
          .onConflict((oc) => oc.column("slug").doUpdateSet({ ...fields, owner_id: user.id }))
          .returning("id")
          .executeTakeFirstOrThrow()

        for (const item of items) {
          const row = asJson({ ...item, signal_id: target.id, owner_id: user.id })
          const { id, created_at, ...update } = row
          await trx
            .insertInto("app.signal_items")
            .values(row)
            .onConflict((oc) => oc.column("id").doUpdateSet(update))
            .execute()
          console.log(`  ${item.medium.padEnd(8)} ${item.title}`)
        }
      })
      console.log(`${slug}: pushed`)
    }
  } finally {
    await remote.destroy()
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message || err)
    process.exit(1)
  })
