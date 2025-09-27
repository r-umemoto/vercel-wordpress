'use client';

import { useState } from "react";
import type { Property } from "./api/blogs/route";

const LIMIT = 10; // 1ページあたりの表示件数

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const searchProperties = async (newOffset: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blogs?q=${encodeURIComponent(query)}&limit=${LIMIT}&offset=${newOffset}`);
      if (!res.ok) {
        throw new Error("物件の取得に失敗しました。");
      }
      const data = await res.json();
      setProperties(data.contents);
      setTotalCount(data.totalCount);
      setOffset(newOffset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    // 新しい検索は常に最初のページから
    searchProperties(0);
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      searchProperties(offset - LIMIT);
    }
  };

  const handleNextPage = () => {
    if (offset + LIMIT < totalCount) {
      searchProperties(offset + LIMIT);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-12">物件検索</h1>
        
        <div className="flex flex-col gap-4 items-center w-full">
          <div className="flex w-full justify-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="キーワードを入力"
              className="border border-gray-300 rounded-full px-4 py-2 w-full max-w-sm text-black"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-5 disabled:bg-gray-400"
            >
              {isLoading ? "検索中..." : "検索"}
            </button>
          </div>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          {totalCount > 0 && (
            <div className="mt-8 w-full text-left">
              <h2 className="text-2xl font-bold border-b pb-2 mb-4">
                検索結果 ({totalCount}件)
              </h2>
              <ul className="mt-4 space-y-2">
                {properties.map((property) => (
                  <li key={property.id} className="text-lg">{property.title}</li>
                ))}
              </ul>
              
              <div className="mt-8 flex justify-between items-center">
                <button
                  onClick={handlePrevPage}
                  disabled={offset === 0 || isLoading}
                  className="rounded-md bg-gray-200 px-4 py-2 disabled:opacity-50 text-black"
                >
                  前へ
                </button>
                <span>
                  {offset / LIMIT + 1} / {Math.ceil(totalCount / LIMIT)} ページ
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={offset + properties.length >= totalCount || isLoading}
                  className="rounded-md bg-gray-200 px-4 py-2 disabled:opacity-50 text-black"
                >
                  次へ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
