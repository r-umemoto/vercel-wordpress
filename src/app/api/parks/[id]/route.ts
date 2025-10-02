import { client } from "@/lib/microcms";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const park = await client.get({
      endpoint: "parks",
      contentId: id,
    });
    return NextResponse.json(park);
  } catch (_error) {
    return NextResponse.json(
      { error: `Failed to fetch park ${id} from microCMS` },
      { status: 500 }
    );
  }
}
