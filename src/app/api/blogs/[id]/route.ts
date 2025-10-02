import { type NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/microcms";
import type { Property } from "../route";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const data = await client.get<Property>({
      endpoint: "blog",
      contentId: id,
    });
    return NextResponse.json(data);
  } catch (_error) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch blogs" }),
}
