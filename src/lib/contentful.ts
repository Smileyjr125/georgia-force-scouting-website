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

// Shape of a team (opponent) entry.
export interface TeamDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
}

// Shape of a game (a piece of film for a team) entry.
export interface GameDTO {
  id: string;
  tag: string;            // short code used in play data, e.g. "AUG"
  label: string;
  videoPlatform: "youtube" | "nfhs" | "other";
  videoUrl: string;
}

// Shape of a formation group (e.g. "Single-Back — Shotgun") entry.
export interface GroupDTO {
  id: string;
  teamId: string;
  key: string;
  title: string;
  order: number;
}

export async function getGroupsForTeam(teamId: string): Promise<GroupDTO[]> {
  const client = getDeliveryClient();
  const entries = await client.getEntries({
    content_type: "formationGroup",
    "fields.team.sys.id": teamId,
    limit: 1000,
    order: ["fields.order"] as any,
  } as any);
  return entries.items.map((item: any) => ({
    id: item.sys.id,
    teamId,
    key: item.fields.key,
    title: item.fields.title,
    order: item.fields.order ?? 0,
  }));
}
export interface FormationDTO {
  id: string;          // Contentful entry ID
  teamId: string;
  label: string;
  groupKey: string;
  groupTitle: string;
  groupOrder: number;
  sheetOrder: number;
  badges: string[];
  positions: { id: number; char: string; x: number; y: number }[];
  plays: { t: string; game: string; outcome: string; label: string }[];
}

export async function getAllTeams(): Promise<TeamDTO[]> {
  const client = getDeliveryClient();
  const entries = await client.getEntries({
    content_type: "team",
    limit: 1000,
    order: ["fields.name"] as any,
  });
  return entries.items.map((item: any) => ({
    id: item.sys.id,
    name: item.fields.name,
    slug: item.fields.slug,
    description: item.fields.description ?? "",
  }));
}

export async function getTeamBySlug(slug: string): Promise<TeamDTO | null> {
  const client = getDeliveryClient();
  const entries = await client.getEntries({
    content_type: "team",
    "fields.slug": slug,
    limit: 1,
  } as any);
  if (entries.items.length === 0) return null;
  const item: any = entries.items[0];
  return {
    id: item.sys.id,
    name: item.fields.name,
    slug: item.fields.slug,
    description: item.fields.description ?? "",
  };
}

export async function getGamesForTeam(teamId: string): Promise<GameDTO[]> {
  const client = getDeliveryClient();
  const entries = await client.getEntries({
    content_type: "game",
    "fields.team.sys.id": teamId,
    limit: 1000,
  } as any);
  return entries.items.map((item: any) => ({
    id: item.sys.id,
    tag: item.fields.tag,
    label: item.fields.label,
    videoPlatform: item.fields.videoPlatform,
    videoUrl: item.fields.videoUrl,
  }));
}

export async function getFormationsForTeam(teamId: string): Promise<FormationDTO[]> {
  const client = getDeliveryClient();
  const entries = await client.getEntries({
    content_type: "formation",
    "fields.team.sys.id": teamId,
    limit: 1000,
    order: ["fields.groupOrder", "fields.sheetOrder"] as any,
  } as any);

  return entries.items.map((item: any) => ({
    id: item.sys.id,
    teamId,
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

// Legacy helper (kept for reference/back-compat) — fetches every formation
// across every team, unfiltered.
export async function getAllFormations(): Promise<FormationDTO[]> {
  const client = getDeliveryClient();
  const entries = await client.getEntries({
    content_type: "formation",
    limit: 1000,
    order: ["fields.groupOrder", "fields.sheetOrder"] as any,
  });

  return entries.items.map((item: any) => ({
    id: item.sys.id,
    teamId: item.fields.team?.sys?.id ?? "",
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
