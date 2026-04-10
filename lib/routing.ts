import type { ProfileRole } from "@/types/database";

export interface DraftWorkPrefill {
  draftExcerpt?: string | null;
  draftGenre?: string | null;
  draftTitle?: string | null;
}

export function getSignedInPath(role: ProfileRole | null | undefined, hasWorks = false) {
  if (role === "author") {
    return hasWorks ? "/dashboard" : "/works/new";
  }

  if (role === "curator") {
    return "/dashboard";
  }

  return "/browse";
}

export function getPostAuthPath(role: ProfileRole | null | undefined, draft?: DraftWorkPrefill) {
  if (role === "author") {
    const params = new URLSearchParams();

    if (draft?.draftTitle) {
      params.set("draft_title", draft.draftTitle);
    }

    if (draft?.draftGenre) {
      params.set("draft_genre", draft.draftGenre);
    }

    if (draft?.draftExcerpt) {
      params.set("draft_excerpt", draft.draftExcerpt);
    }

    const query = params.toString();
    return query ? `/works/new?${query}` : "/works/new";
  }

  return "/browse";
}
