import { client } from "@/lib/microcms";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const { params } = context;
  const { id } = params;

  try {
    const park = await client.get({
      endpoint: "parks",
      contentId: id,
    });
    return NextResponse.json(park);
  } catch {
    return NextResponse.json(
      { error: `Failed to fetch park ${id} from microCMS` },
      { status: 500 }
    );
  }
}
