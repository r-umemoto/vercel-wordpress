import { NextResponse } from "next/server";
import { client } from "../../../lib/microcms";
import type { Property } from "../route";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const data = await client.get<Property>({
      endpoint: "blog",
      contentId: id,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch property from microCMS" },
      { status: 500 }
    );
  }
}
