// ---------------------------------------------------------------------------
// Company Knowledge RAG — gateway GraphQL client for knowledge-base articles.
//
// Articles are owned by frontline_api; we read them through the erxes gateway
// so this feature needs no changes outside this plugin AND so query-time
// fetches run under erxes's own permission layer (authoritative post-filter).
//
// Auth: a `user` header (the asking user) when present — erxes resolves the
// request as that user — otherwise the API token from agent settings (used by
// the background sweep and the customer bot bridge).
// ---------------------------------------------------------------------------

export interface KbArticle {
  _id: string;
  title?: string;
  summary?: string;
  content?: string;
  status?: string;
  isPrivate?: boolean;
  categoryId?: string;
  topicId?: string;
  modifiedDate?: string;
}

const ARTICLE_FIELDS = '_id title summary content status isPrivate categoryId topicId modifiedDate';
const PAGE_SIZE = 100;

async function gql(
  apiUrl: string,
  authHeaders: Record<string, string>,
  query: string,
  variables: Record<string, any>,
): Promise<any> {
  const res = await fetch(`${apiUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`Gateway GraphQL failed (${res.status})`);
  }
  const json: any = await res.json();
  if (json.errors?.length) {
    throw new Error(`Gateway GraphQL error: ${json.errors[0]?.message || 'unknown'}`);
  }
  return json.data ?? {};
}

export function buildAuthHeaders(opts: {
  userHeader?: string;
  apiToken?: string;
}): Record<string, string> {
  if (opts.userHeader) return { user: opts.userHeader };
  if (opts.apiToken) return { Authorization: opts.apiToken };
  return {};
}

/**
 * Every published, non-private article — the entire v1 corpus. Paginates
 * until a short page. Private articles are dropped here as well as at
 * retrieval time (defense in depth).
 */
export async function fetchPublishedArticles(
  apiUrl: string,
  authHeaders: Record<string, string>,
): Promise<KbArticle[]> {
  const out: KbArticle[] = [];

  for (let page = 1; ; page++) {
    const data = await gql(
      apiUrl,
      authHeaders,
      `query KnowledgeSweep($page: Int, $perPage: Int, $status: String) {
        knowledgeBaseArticles(page: $page, perPage: $perPage, status: $status) { ${ARTICLE_FIELDS} }
      }`,
      { page, perPage: PAGE_SIZE, status: 'publish' },
    );
    const batch: KbArticle[] = data.knowledgeBaseArticles || [];
    out.push(...batch.filter((a) => a.status === 'publish' && !a.isPrivate));
    if (batch.length < PAGE_SIZE) break;
  }

  return out;
}

/**
 * Live fetch by ids — the authoritative post-filter. Returns only articles
 * the gateway is willing to show the caller; the caller must still drop
 * anything not published or private.
 */
export async function fetchArticlesByIds(
  apiUrl: string,
  authHeaders: Record<string, string>,
  ids: string[],
): Promise<KbArticle[]> {
  if (!ids.length) return [];
  const data = await gql(
    apiUrl,
    authHeaders,
    `query KnowledgeVerify($articleIds: [String], $perPage: Int) {
      knowledgeBaseArticles(articleIds: $articleIds, perPage: $perPage) { ${ARTICLE_FIELDS} }
    }`,
    { articleIds: ids, perPage: ids.length },
  );
  return data.knowledgeBaseArticles || [];
}
