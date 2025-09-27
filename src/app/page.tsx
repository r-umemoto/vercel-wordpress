'use client';

import { useState } from "react";
import Image from "next/image";
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
        throw new Error("ブログの取得に失敗しました。");
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
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div>
          <h1 className="text-2xl font-semibold">Welcome to React!</h1>
          <p className="mt-2">You are now editing a React component.</p>
        </div>

        <div className="flex flex-col gap-4 items-center w-full">
          <button
            onClick={fetchBlogs}
            disabled={isLoading}
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto disabled:bg-gray-400"
          >
            {isLoading ? "読み込み中..." : "ブログ一覧を取得"}
          </button>

          {error && <p className="text-red-500">{error}</p>}

          {blogs.length > 0 && (
            <div className="mt-8 w-full text-left">
              <h2 className="text-xl font-bold">ブログ記事一覧</h2>
              <ul className="mt-4 list-disc list-inside">
                {blogs.map((blog) => (
                  <li key={blog.id}>{blog.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}