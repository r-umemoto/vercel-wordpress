import { type MicroCMSQueries } from "microcms-js-sdk";
import { NextResponse } from "next/server";
import { client } from "../../../lib/microcms";

// 物件の型定義
export interface Property {
  id: string;
  title: string;
  publishedAt: string;
  description?: string;
  content?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Pagination params
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  // Filter params
  const title = searchParams.get('title');
  const description = searchParams.get('description');
  const content = searchParams.get('content');
  const publishedAt = searchParams.get('publishedAt');

  const queries: MicroCMSQueries = {};
  
  // Build filters
  const filters: string[] = [];
  if (title) filters.push(`title[contains]${title}`);
  if (description) filters.push(`description[contains]${description}`);
  if (content) filters.push(`content[contains]${content}`);
  if (publishedAt) filters.push(`publishedAt[contains]${publishedAt}`);

  if (filters.length > 0) {
    queries.filters = filters.join('[or]');
  }

  // Add pagination to queries
  if (limit) {
    queries.limit = parseInt(limit, 10);
  }
  if (offset) {
    queries.offset = parseInt(offset, 10);
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