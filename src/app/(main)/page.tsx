import { client } from "@/lib/microcms";
import type { Park } from "../api/parks/route";
import ParkSearch from "@/components/ParkSearch";
import { type MicroCMSListResponse } from "microcms-js-sdk";

const LIMIT = 6;

async function getInitialParks(): Promise<MicroCMSListResponse<Park>> {
  try {
    const data = await client.getList<Park>({
      endpoint: "parks",
      queries: { limit: LIMIT, offset: 0, filters: "pickup[equals]true" },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch initial parks:", error);
    return { contents: [], totalCount: 0, limit: LIMIT, offset: 0 };
  }
}

export default async function Home() {
  const initialData = await getInitialParks();

  return (
    <ParkSearch
      initialParks={initialData.contents}
    />
  );
}