import { useMemo } from "react";
import { Group } from "@/types";

/** Extract searchable tag from item - works for Group objects or raw tag strings */
export type GroupLike = Group | string;

function getTag(item: GroupLike): string {
  return typeof item === "string" ? item : item.tag;
}

/** Filter groups by search query, returns up to `limit` matches */
export function useGroupSearch<T extends GroupLike>(
  allGroups: T[],
  query: string,
  limit: number = 5,
) {
  const filtered = useMemo(() => {
    if (!query) return allGroups.slice(0, limit);
    const lower = query.toLowerCase();
    return allGroups
      .filter((g) => getTag(g).toLowerCase().includes(lower))
      .slice(0, limit);
  }, [allGroups, query, limit]);

  return filtered;
}