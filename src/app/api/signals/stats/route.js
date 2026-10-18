import { platformStats } from "@/lib/signals/store.js"

export async function GET(request) {
  try {
    const bumpViews = new URL(request.url).searchParams.get("view") === "1"
    const stats = await platformStats({ bumpViews })
    return Response.json({ stats })
  } catch (e) {
    console.error(e)
    return Response.json({ error: "Failed to load stats" }, { status: 500 })
  }
}
