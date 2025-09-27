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

  const queries: MicroCMSQueries = {};
  if (q) {
    queries.q = q;
  }

  try {
    const data = await client.getList<Property>({
      endpoint: "blog",
      queries: queries,
    });
    return NextResponse.json(data.contents);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch properties from microCMS" },
      { status: 500 }
    );
  }
}
