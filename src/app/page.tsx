'use client';

import { useState } from "react";
import type { Blog } from "./api/blogs/route";

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blogs");
      if (!res.ok) {
        throw new Error("物件の取得に失敗しました。");
      }
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-12">物件検索</h1>
        
        <div className="flex flex-col gap-4 items-center w-full">
          <button
            onClick={fetchBlogs}
            disabled={isLoading}
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-5 w-full sm:w-auto disabled:bg-gray-400"
          >
            {isLoading ? "読み込み中..." : "物件一覧を取得"}
          </button>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          {blogs.length > 0 && (
            <div className="mt-8 w-full text-left">
              <h2 className="text-2xl font-bold border-b pb-2 mb-4">物件一覧</h2>
              <ul className="mt-4 space-y-2">
                {blogs.map((blog) => (
                  <li key={blog.id} className="text-lg">{blog.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
