import { type MicroCMSQueries } from "microcms-js-sdk";
import { type NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/microcms";

// 物件の型定義
export interface Property {
  id: string;
  title: string;
  publishedAt: string;
  description?: string;
  content?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Pagination params
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  // Detailed search fields
  const title = searchParams.get('title');
  const description = searchParams.get('description');
  const content = searchParams.get('content');
  const publishedAt = searchParams.get('publishedAt');

  // Simple search field
  const q = searchParams.get('q');

  const queries: MicroCMSQueries = {};

  // Build filters for detailed search
  const detailFilters: string[] = [];
  if (title) detailFilters.push(`title[contains]${title}`);
  if (description) detailFilters.push(`description[contains]${description}`);
  if (content) detailFilters.push(`content[contains]${content}`);
  if (publishedAt) detailFilters.push(`publishedAt[greater_than]${publishedAt}`);

  if (detailFilters.length > 0) {
    queries.filters = detailFilters.join('[or]');
  } else if (q) {
    // Fallback to simple full-text search
    queries.q = q;
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
    const data = await client.getList<Property>({
      endpoint: "blog",
      queries: queries,
    });
    // コンテンツと総件数を返す
    return NextResponse.json({ contents: data.contents, totalCount: data.totalCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch properties from microCMS" },
      { status: 500 }
    );
  }
}
