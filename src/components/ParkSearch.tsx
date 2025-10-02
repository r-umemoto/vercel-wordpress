'use client';

import { useState, useEffect } from "react";
import type { Park } from "../app/api/parks/route";
import Spinner from "./Spinner";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const ParkDetailPanel = dynamic(() => import("./ParkDetailPanel"), { ssr: false });

const LIMIT = 10;

type SearchParams = { q?: string };

// The props are no longer needed as the component fetches its own data.

export default function ParkSearch() {
  const [parks, setParks] = useState<Park[]>([]); // Initialize with empty array
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setOffset] = useState(0);

  // State to hold the params for the current active search (for pagination)
  const [, setCurrentParams] = useState<SearchParams>({});

  // State for detail panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [isPanelLoading, setIsPanelLoading] = useState(false);

  // Fetch parks on initial render
  useEffect(() => {
    searchParks({}, 0);
  }, []);

  const searchParks = async (params: SearchParams, newOffset: number) => {
    setIsLoading(true);
    setError(null);

    const queryParams = new URLSearchParams();
    queryParams.set("limit", String(LIMIT));
    queryParams.set("offset", String(newOffset));
    queryParams.set("filters", "pickup[equals]true");

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
        <div className="w-full max-w-5xl">
          <h1 className="text-4xl font-bold text-center mb-12">公園一覧</h1>

          <div className="flex flex-col gap-8 items-center w-full">
            {/* Search form has been removed */}

            {error && <p className="text-red-500 mt-4">{error}</p>}
            {isLoading && !error && <Spinner />}

            {/* Results */}
            <div className="w-full">
              {!isLoading && parks.length === 0 && (
                   <p className="mt-8 text-center">公園は見つかりませんでした。</p>
              )}
            
              {parks.length > 0 && (
                <div className="mt-8 w-full text-left">
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parks.map((park) => (
                      <a
                        key={park.id}
                        href={`/parks/${park.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleParkClick(park.id);
                        }}
                        className="group flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden"
                      >
                        {/* Image container with aspect ratio */}
                        <div className="relative w-full aspect-[5/7] overflow-hidden">
                          <Image
                            src={park.thumbnail?.url || 'https://images.microcms-assets.io/assets/159949694f6a490ea709fe5e4d26ba06/6f9155fe0bce45248d40dc8f2bcb35f7/sample_no_img.png'}
                            alt={park.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        {/* Text content */}
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-1 truncate">{park.name}</h3>
                          {park.description && <p className="text-sm text-gray-600 dark:text-gray-400 h-[2.5rem] overflow-hidden">{park.description}</p>}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Other ways to search */}
            <div className="w-full mt-16">
              <h2 className="text-2xl font-bold text-center mb-8">他の方法で探す</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1: Map */}
                <Link href="/map" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer">
                  <Image src="/globe.svg" alt="Map Icon" width={48} height={48} />
                  <h3 className="mt-4 text-lg font-semibold">地図から探す</h3>
                </Link>

                {/* Card 2: Address */}
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer">
                  <Image src="/file.svg" alt="Address Icon" width={48} height={48} />
                  <h3 className="mt-4 text-lg font-semibold">住所から探す</h3>
                </div>

                {/* Card 3: Jobs */}
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer">
                  <Image src="/window.svg" alt="Jobs Icon" width={48} height={48} />
                  <h3 className="mt-4 text-lg font-semibold">求人</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}