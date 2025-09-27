'use client';

import { useState } from "react";
import Link from "next/link";
import type { Property } from "./api/blogs/route";
import SideMenu, { type SearchCriteria } from "../components/SideMenu";

const LIMIT = 10; // 1ページあたりの表示件数

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState<Partial<SearchCriteria>>({});

  const searchProperties = async (criteria: Partial<SearchCriteria>, newOffset: number) => {
    setIsLoading(true);
    setError(null);
    
    const params = new URLSearchParams();
    params.set("limit", String(LIMIT));
    params.set("offset", String(newOffset));

    // Add criteria to params if they exist
    Object.entries(criteria).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    try {
      const res = await fetch(`/api/blogs?${params.toString()}`);
      if (!res.ok) {
        throw new Error("物件の取得に失敗しました。");
      }
      const data = await res.json();
      setProperties(data.contents);
      setTotalCount(data.totalCount);
      setOffset(newOffset);
      setCurrentCriteria(criteria); // Save current search criteria for pagination
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (criteria: SearchCriteria) => {
    // New search always starts from the first page
    searchProperties(criteria, 0);
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      searchProperties(currentCriteria, offset - LIMIT);
    }
  };

  const handleNextPage = () => {
    if (offset + LIMIT < totalCount) {
      searchProperties(currentCriteria, offset + LIMIT);
    }
  };

  return (
    <>
      <SideMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSearch={handleSearch}
      />
      <main className="flex min-h-screen flex-col items-center p-24">
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl font-bold text-center mb-12">物件検索</h1>
          
          <div className="flex flex-col gap-4 items-center w-full">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="rounded-full bg-gray-700 px-6 py-3 text-white hover:bg-gray-600"
            >
              詳細検索を開く
            </button>

            {error && <p className="text-red-500 mt-4">{error}</p>}

            {isLoading && <p className="mt-8">検索中...</p>}

            {!isLoading && totalCount === 0 && properties.length > 0 && (
                 <p className="mt-8">条件に合う物件は見つかりませんでした。</p>
            )}

            {totalCount > 0 && (
              <div className="mt-8 w-full text-left">
                <h2 className="text-2xl font-bold border-b pb-2 mb-4">
                  検索結果 ({totalCount}件)
                </h2>
                <ul className="mt-4 space-y-2">
                  {properties.map((property) => (
                    <li key={property.id} className="text-lg">
                      <Link href={`/properties/${property.id}`} className="hover:underline">
                        {property.title}
                      </Link>
                    </li>
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
    </>
  );
}
