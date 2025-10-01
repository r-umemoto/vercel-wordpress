import { client } from "@/lib/microcms";
import type { Property } from "./api/blogs/route";
import PropertySearch from "@/components/PropertySearch";
import { type MicroCMSListResponse } from "microcms-js-sdk";

const LIMIT = 10;

async function getInitialProperties(): Promise<MicroCMSListResponse<Property>> {
  try {
    const data = await client.getList<Property>({
      endpoint: "blog",
      queries: { limit: LIMIT, offset: 0 },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch initial properties:", error);
    return { contents: [], totalCount: 0, limit: LIMIT, offset: 0 };
  }
}

export default async function Home() {
  const initialData = await getInitialProperties();

  return (
    <PropertySearch 
      initialProperties={initialData.contents}
      initialTotalCount={initialData.totalCount}
    />
  );
}