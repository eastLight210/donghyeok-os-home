// Keep the upstream fixed: browsers use this same-origin route without RSS CORS requirements.
export async function GET() {
  try {
    const response = await fetch("https://blog.donghyeok.net/rss.xml", {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("Blog feed unavailable");
    return new Response(await response.text(), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Blog feed unavailable", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
