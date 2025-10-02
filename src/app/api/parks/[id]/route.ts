import { client } from "@/lib/microcms";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } as any
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
