import contentfulPkg from "contentful";
const { createClient: createDeliveryClient } = contentfulPkg;
import contentfulManagementPkg from "contentful-management";
const { createClient: createManagementClient } = contentfulManagementPkg;

// Read-only client — safe to use anywhere server-side to fetch formation data.
export function getDeliveryClient() {
  const spaceId = import.meta.env.CONTENTFUL_SPACE_ID;
  const accessToken = import.meta.env.CONTENTFUL_CDA_TOKEN;
  if (!spaceId || !accessToken) {
    throw new Error("Missing CONTENTFUL_SPACE_ID or CONTENTFUL_CDA_TOKEN env vars.");
  }
  return createDeliveryClient({ space: spaceId, accessToken });
}

// Read/write client — ONLY ever call this from server-side API routes.
// The token this uses has full write access to your Contentful space.
export function getManagementClient() {
  const accessToken = import.meta.env.CONTENTFUL_CMA_TOKEN;
  if (!accessToken) {
    throw new Error("Missing CONTENTFUL_CMA_TOKEN env var.");
  }
  return createManagementClient({ accessToken });
}

export async function getManagementEnvironment() {
  const client = getManagementClient();
  const spaceId = import.meta.env.CONTENTFUL_SPACE_ID;
  const space = await client.getSpace(spaceId);
  return space.getEnvironment("master");
}

// Shape of a formation entry as the frontend consumes it.
export interface FormationDTO {
  id: string;          // Contentful entry ID
  label: string;
  groupKey: string;
  groupTitle: string;
  groupOrder: number;
  sheetOrder: number;
  badges: string[];
  positions: { id: number; char: string; x: number; y: number }[];
  plays: { t: string; game: string; outcome: string; label: string }[];
}

export async function getAllFormations(): Promise<FormationDTO[]> {
  const client = getDeliveryClient();
  const entries = await client.getEntries({
    content_type: "formation",
    limit: 1000,
    order: ["fields.groupOrder", "fields.sheetOrder"] as any,
  });

  return entries.items.map((item: any) => ({
    id: item.sys.id,
    label: item.fields.label,
    groupKey: item.fields.groupKey,
    groupTitle: item.fields.groupTitle,
    groupOrder: item.fields.groupOrder ?? 0,
    sheetOrder: item.fields.sheetOrder ?? 0,
    badges: item.fields.badges ?? [],
    positions: item.fields.positions ?? [],
    plays: item.fields.plays ?? [],
  }));
}
