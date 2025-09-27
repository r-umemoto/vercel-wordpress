import { createClient } from "microcms-js-sdk";
import { NextResponse } from "next/server";

// ブログ記事の型定義
export interface Blog {
  id: string;
  title: string;
  publishedAt: string;
}

// microCMSクライアントの初期化
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "",
  apiKey: process.env.MICROCMS_API_KEY || "",
});

export async function GET() {
  try {
    const data = await client.getList<Blog>({
      endpoint: "blog", // microCMSのAPIエンドポイント名
    });
    return NextResponse.json(data.contents);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch blogs from microCMS" },
      { status: 500 }
    );
  }
}
