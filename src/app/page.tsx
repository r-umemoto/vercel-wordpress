'use client';

import { useState } from "react";
import type { Property } from "./api/blogs/route";
import SideMenu, { type SearchCriteria } from "../components/SideMenu";
import PropertyDetailPanel from "../components/PropertyDetailPanel";
import Spinner from "../components/Spinner";

const LIMIT = 10;

type SearchParams = { q?: string } & Partial<SearchCriteria>;

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // State for simple search
  const [simpleQuery, setSimpleQuery] = useState("");

  // State for detailed search menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // State to hold the params for the current active search (for pagination)
  const [currentParams, setCurrentParams] = useState<SearchParams>({});

  // State for detail panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isPanelLoading, setIsPanelLoading] = useState(false);

  const searchProperties = async (params: SearchParams, newOffset: number) => {
    setIsLoading(true);
    setError(null);
    
    const queryParams = new URLSearchParams();
    queryParams.set("limit", String(LIMIT));
    queryParams.set("offset", String(newOffset));

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.set(key, value);
      }
    });

    try {
      const res = await fetch(`/api/blogs?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("物件の取得に失敗しました。");
      }
      const data = await res.json();
      setProperties(data.contents);
      setTotalCount(data.totalCount);
      setOffset(newOffset);
      setCurrentParams(params); // Save current search params for pagination
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimpleSearch = () => {
    searchProperties({ q: simpleQuery }, 0);
  };

  const handleDetailedSearch = (criteria: SearchCriteria) => {
    searchProperties(criteria, 0);
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      searchProperties(currentParams, offset - LIMIT);
    }
  };

  const handleNextPage = () => {
    if (offset + LIMIT < totalCount) {
      searchProperties(currentParams, offset + LIMIT);
    }
  };

  const handlePropertyClick = async (id: string) => {
    setIsPanelLoading(true);
    setSelectedProperty(null);
    setIsPanelOpen(true);
    try {
      const res = await fetch(`/api/blogs/${id}`);
      if (!res.ok) {
        throw new Error("物件の詳細の取得に失敗しました。");
      }
      const data = await res.json();
      setSelectedProperty(data);
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
    setSelectedProperty(null);
  };

  return (
    <>
      <SideMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSearch={handleDetailedSearch}
      />

      <PropertyDetailPanel
        isOpen={isPanelOpen}
        isLoading={isPanelLoading}
        property={selectedProperty}
        onClose={handleClosePanel}
      />

      {/* New Detailed Search Trigger Button */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-1/2 -translate-y-1/2 left-0 z-30 bg-orange-500/50 text-white py-6 px-2 rounded-r-lg cursor-pointer hover:bg-orange-600 active:bg-orange-600 shadow-lg flex items-center justify-center"
        aria-label="詳細検索を開く"
      >
        <span style={{ writingMode: 'vertical-rl' }}>詳細検索</span>
      </button>

      <main className="flex min-h-screen flex-col items-center py-4 pr-4 pl-8 sm:p-8 md:p-12 lg:p-24">
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl font-bold text-center mb-12">物件検索</h1>
          
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
            {isLoading && <Spinner />}
            
            {/* Results */}
            <div className="w-full">
              {!isLoading && totalCount === 0 && Object.keys(currentParams).length > 0 && (
                   <p className="mt-8 text-center">条件に合う物件は見つかりませんでした。</p>
              )}

              {totalCount > 0 && (
                <div className="mt-8 w-full text-left">
                  <h2 className="text-2xl font-bold border-b pb-2 mb-4">
                    検索結果 ({totalCount}件)
                  </h2>
                  <div className="mt-6 space-y-4">
                    {properties.map((property) => (
                      <div 
                        key={property.id} 
                        onClick={() => handlePropertyClick(property.id)}
                        className="block p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                      >
                        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">{property.title}</h3>
                        {property.description && <p className="text-gray-700 dark:text-gray-400">{property.description}</p>}
                      </div>
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
        </div>
      </main>
    </>
  );
}
