import { type MicroCMSQueries } from "microcms-js-sdk";
import { type NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/microcms";

// 公園の型定義
export interface Park {
  id: string;
  name: string;
  description?: string;
  content?: string;
  thumbnail?: {
    url: string;
    height: number;
    width: number;
  };
  map?: {
    lng: number;
    lat: number;
    address: string;
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Pagination params
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  // Simple search field
  const q = searchParams.get('q');
  const filters = searchParams.get('filters');

  const queries: MicroCMSQueries = {};

  if (q) {
    queries.q = q;
  }

  if (filters) {
    queries.filters = filters;
  }

  // Add pagination to queries
  if (limit) {
    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit)) {
      queries.limit = parsedLimit;
    }
  }
  if (offset) {
    const parsedOffset = parseInt(offset, 10);
    if (!isNaN(parsedOffset)) {
      queries.offset = parsedOffset;
    }
  }

  try {
    const data = await client.getList<Park>({
      endpoint: "parks",
      queries: queries,
    });
    // コンテンツと総件数を返す
    return NextResponse.json({ contents: data.contents, totalCount: data.totalCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch parks from microCMS" },
      { status: 500 }
    );
  }
}
