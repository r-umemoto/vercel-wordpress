import { notFound } from "next/navigation";
import { client } from "@/lib/microcms";
import type { Park } from "@/app/api/parks/route";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import { Metadata } from "next";

// ISR: ページの再生成時間を60秒に設定
export const revalidate = 60;

type Props = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  let park: Park;

  try {
    park = await client.get<Park>({
      endpoint: "parks",
      contentId: id,
    });
  } catch (error) {
    notFound();
  }

  return {
    title: park.name,
    description: park.description,
  };
}


 /**
 * 公園詳細ページ (サーバーコンポーネント)
 * ISR対応により、初回アクセス時に静的ページを生成し、
 * 60秒ごとにバックグラウンドで再生成して鮮度を保ちます。
 */
export default async function ParkDetail({ params }: Props) {
  const { id } = params;
  let park: Park;

  try {
    // サーバーサイドでmicroCMSから直接データを取得
    park = await client.get<Park>({
      endpoint: "parks",
      contentId: id,
    });
  } catch (error) {
    // データ取得に失敗した場合は404ページを表示
    notFound();
  }

  // サーバーサイドでHTMLをサニタイズ
  const cleanContent = park.content
    ? DOMPurify.sanitize(park.content)
    : "";

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24 pb-20">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">{park.name}</h1>
        {park.description && (
          <p className="text-lg text-gray-600 my-4">{park.description}</p>
        )}

        {cleanContent && (
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />
        )}
      </div>
      <footer className="fixed bottom-0 left-0 right-0 w-full bg-orange-500/50 p-4 text-center">
        <Link href="/" className="text-white font-bold hover:underline">
          検索ページへ戻る
        </Link>
      </footer>
    </main>
  );
}
