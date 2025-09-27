import { createClient, type MicroCMSQueries } from "microcms-js-sdk";
import { NextResponse } from "next/server";

// 物件の型定義
export interface Property {
  id: string;
  title: string;
  publishedAt: string;
}

// microCMSクライアントの初期化
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "",
  apiKey: process.env.MICROCMS_API_KEY || "",
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  const queries: MicroCMSQueries = {};
  if (q) {
    queries.q = q;
  }
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