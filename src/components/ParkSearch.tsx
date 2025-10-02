'use client';

import { useState } from "react";
import type { Park } from "../app/api/parks/route";
import Spinner from "./Spinner";
import dynamic from "next/dynamic";
import Image from "next/image";

const ParkDetailPanel = dynamic(() => import("./ParkDetailPanel"), { ssr: false });

const LIMIT = 10;

type SearchParams = { q?: string };

interface ParkSearchProps {
  initialParks: Park[];
  initialTotalCount?: number;
}

export default function ParkSearch({ initialParks, initialTotalCount = 0 }: ParkSearchProps) {
  const [parks, setParks] = useState<Park[]>(initialParks);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  // State for simple search
  const [simpleQuery, setSimpleQuery] = useState("");

  // State to hold the params for the current active search (for pagination)
  const [currentParams, setCurrentParams] = useState<SearchParams>({});

  // State for detail panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [isPanelLoading, setIsPanelLoading] = useState(false);

  const searchParks = async (params: SearchParams, newOffset: number) => {
    setIsLoading(true);
    setError(null);

    const queryParams = new URLSearchParams();
    queryParams.set("limit", String(LIMIT));
    queryParams.set("offset", String(newOffset));

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.set(key, value as string);
      }
    });

    try {
      const res = await fetch(`/api/parks?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("公園の取得に失敗しました。");
      }
      const data = await res.json();
      setParks(data.contents);
      setOffset(newOffset);
      setCurrentParams(params); // Save current search params for pagination
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimpleSearch = () => {
    searchParks({ q: simpleQuery }, 0);
  };

  const handleParkClick = async (id: string) => {
    setIsPanelLoading(true);
    setSelectedPark(null);
    setIsPanelOpen(true);
    try {
      const res = await fetch(`/api/parks/${id}`);
      if (!res.ok) {
        throw new Error("公園の詳細の取得に失敗しました。");
      }
      const data = await res.json();
      setSelectedPark(data);
    } catch (err) {
      console.error(err);
      // Close panel and show error?
      handleClosePanel();
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsPanelLoading(false);
    }
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedPark(null);
  };

  return (
    <>
      <ParkDetailPanel
        isOpen={isPanelOpen}
        isLoading={isPanelLoading}
        park={selectedPark}
        onClose={handleClosePanel}
      />

      <main className="flex min-h-screen flex-col items-center py-4 pr-4 pl-8 sm:p-8 md:p-12 lg:p-24">
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl font-bold text-center mb-12">公園検索</h1>

          <div className="flex flex-col gap-8 items-center w-full">
            {/* Simple Search Form */}
            <form
              className="flex flex-col sm:flex-row w-full justify-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSimpleSearch();
              }}
            >
              <input
                type="text"
                value={simpleQuery}
                onChange={(e) => setSimpleQuery(e.target.value)}
                placeholder="キーワードを入力 (全項目対象)"
                className="border border-gray-300 bg-white rounded-full px-4 py-2 w-full sm:max-w-sm text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-full bg-blue-600 px-5 text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                検索
              </button>
            </form>

            {error && <p className="text-red-500 mt-4">{error}</p>}
            {isLoading && !error && <Spinner />}

            {/* Results */}
            <div className="w-full">
              {!isLoading && totalCount === 0 && Object.keys(currentParams).length > 0 && (
                <p className="mt-8 text-center">条件に合う公園は見つかりませんでした。</p>
              )}

              {totalCount > 0 && (
                <div className="mt-8 w-full text-left">
                  <h2 className="text-2xl font-bold border-b pb-2 mb-4">
                    検索結果 ({totalCount}件)
                  </h2>
                  <div className="mt-6 space-y-4">
                    {parks.map((park) => (
                      <a
                        key={park.id}
                        href={`/parks/${park.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleParkClick(park.id);
                        }}
                        className="flex items-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                      >
                        <div className="flex-shrink-0 mr-4">
                          <Image
                            src={park.thumbnail?.url || 'https://images.microcms-assets.io/assets/159949694f6a490ea709fe5e4d26ba06/6f9155fe0bce45248d40dc8f2bcb35f7/sample_no_img.png'}
                            alt={park.title}
                            width={park.thumbnail?.width || 80}
                            height={park.thumbnail?.height || 80}
                            className="rounded-md object-cover"
                            style={{ width: 80, height: 80 }} // Keep a consistent size
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">{park.title}</h3>
                          {park.description && <p className="text-gray-700 dark:text-gray-400">{park.description}</p>}
                        </div>
                      </a>
                    ))}
                  </div>

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
                      disabled={offset + parks.length >= totalCount || isLoading}
                      className="rounded-md bg-gray-200 px-4 py-2 disabled:opacity-50 text-black"
                    >
                      次へ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
