import { notFound } from "next/navigation";
import { client } from "@/lib/microcms";
import type { Property } from "@/app/api/blogs/route";
import DOMPurify from "isomorphic-dompurify";

// ISR: ページの再生成時間を60秒に設定
export const revalidate = 60;

type Props = {
  params: {
    id: string;
  };
};

/**
 * 物件詳細ページ (サーバーコンポーネント)
 * ISR対応により、初回アクセス時に静的ページを生成し、
 * 60秒ごとにバックグラウンドで再生成して鮮度を保ちます。
 */
export default async function PropertyDetail({ params }: Props) {
  const { id } = params;
  let property: Property;

  try {
    // サーバーサイドでmicroCMSから直接データを取得
    property = await client.get<Property>({
      endpoint: "blog",
      contentId: id,
    });
  } catch (error) {
    // データ取得に失敗した場合は404ページを表示
    notFound();
  }

  // サーバーサイドでHTMLをサニタイズ
  const cleanContent = property.content
    ? DOMPurify.sanitize(property.content)
    : "";

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">{property.title}</h1>
        {property.description && (
          <p className="text-lg text-gray-600 my-4">{property.description}</p>
        )}
        <p className="text-gray-500 mb-8">
          公開日: {new Date(property.publishedAt).toLocaleDateString()}
        </p>

        {cleanContent && (
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />
        )}
      </div>
    </main>
  );
}
