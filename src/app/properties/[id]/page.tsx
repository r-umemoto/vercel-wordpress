import { client } from "../../../lib/microcms";
import type { Property } from "../../api/blogs/route";
import { notFound } from "next/navigation";

type Props = {
  params: {
    id: string;
  };
};

// This is a server component, so we can fetch data directly
export default async function PropertyDetail({ params }: Props) {
  const property = await client.getListDetail<Property>({
    endpoint: "blog",
    contentId: params.id,
  }).catch(() => {
    // Return 404 if the property is not found
    notFound();
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <article className="w-full max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">{property.title}</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12">
          公開日: {new Date(property.publishedAt).toLocaleDateString()}
        </p>

        {/* Summary Section */}
        {property.description && (
          <section className="mb-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">概要</h2>
            <p className="text-gray-800 dark:text-gray-200">{property.description}</p>
          </section>
        )}

        {/* Content Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">本文</h2>
          {/* 
            In a real-world application, you should sanitize the HTML content 
            to prevent XSS attacks. Libraries like 'dompurify' are recommended.
          */}
          <div
            className="space-y-4"
            dangerouslySetInnerHTML={{
              __html: property.content || "",
            }}
          />
        </section>
      </article>
    </main>
  );
}