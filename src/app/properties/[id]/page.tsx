'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Property } from "../../api/blogs/route";
import DOMPurify from "isomorphic-dompurify";
import Spinner from "../../../components/Spinner";

export default function PropertyDetail() {
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();

  useEffect(() => {
    const fetchProperty = async () => {
      const id = params.id;
      if (!id) {
        setError("物件IDが見つかりません。");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/blogs/${id}`);
        if (!res.ok) {
          throw new Error("物件の詳細の取得に失敗しました。");
        }
        const data = await res.json();
        setProperty(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProperty();
    }
  }, [params.id]);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="p-4 sm:p-8 md:p-12 lg:p-24 text-center text-red-500">{error}</div>;
  }

  if (!property) {
    return <div className="p-4 sm:p-8 md:p-12 lg:p-24 text-center">物件が見つかりません。</div>;
  }

  // Sanitize the HTML content before rendering
  const cleanContent = property.content ? DOMPurify.sanitize(property.content) : "";

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">{property.title}</h1>
        <p className="text-gray-500 mb-8">公開日: {new Date(property.publishedAt).toLocaleDateString()}</p>
        
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