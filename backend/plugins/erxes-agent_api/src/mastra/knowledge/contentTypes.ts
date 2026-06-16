// ---------------------------------------------------------------------------
// Company Knowledge RAG — content-type registry.
//
// One entry per embeddable erxes content type. Each entry knows how to:
//   - list its records through the gateway for the sweep (paginated),
//   - re-fetch specific records LIVE as the asking user (the authoritative
//     post-filter — whatever erxes's own resolvers return IS the permission
//     answer; we never reimplement scope logic here),
//   - decide sweep-side visibility (e.g. KB: published + public only),
//   - serialize a record into embeddable text chunks.
//
// Adding a content type = adding one entry here. The sweep, the Qdrant
// payload shape, and the retrieval tool are all registry-driven.
// ---------------------------------------------------------------------------

import {
  articleToChunks,
  htmlToText,
  splitIntoChunks,
  ArticleChunk,
} from './serializer';

// Whatever the gateway's JSON response parses to — same contract as
// JSON.parse, without committing to a shape erxes resolvers don't guarantee.
export type GqlData = ReturnType<typeof JSON.parse>;

export type GqlExec = (
  query: string,
  variables: Record<string, unknown>,
) => Promise<GqlData>;

export interface KnowledgeRecord {
  _id: string;
  title: string;
  chunks: ArticleChunk[];
  modifiedDate: string;
}

export interface KnowledgeContentType {
  /** Stable tag stored in every Qdrant point payload. */
  type: string;
  /** Owning erxes plugin (status display + docs only). */
  plugin: string;
  /** List all sweep-eligible records. `max` 0 = unlimited. */
  list(gql: GqlExec, max: number): Promise<KnowledgeRecord[]>;
  /**
   * Live re-fetch by ids AS THE CALLER (user header or app token). Returns
   * only ids the caller is currently allowed to see. Must fail closed: every
   * error → treat as denied.
   */
  allowedIds(gql: GqlExec, ids: string[]): Promise<Set<string>>;
}

/** Normalize a date-ish value to ISO, or '' when absent. */
const toIso = (dateValue: unknown): string =>
  dateValue ? new Date(dateValue as string | number | Date).toISOString() : '';

/** Compose "Label: value" lines, skipping empties, into a single chunk set. */
function linesToChunks(
  title: string,
  lines: Array<[string, unknown]>,
): ArticleChunk[] {
  const body = lines
    .filter(
      ([, value]) =>
        value !== undefined && value !== null && String(value).trim() !== '',
    )
    .map(([label, value]) => `${label}: ${String(value).trim()}`)
    .join('\n');
  const text = [title, body].filter(Boolean).join('\n');
  if (!text.trim()) return [];
  return splitIntoChunks(text).map((chunkText, chunkIndex) => ({
    chunkIndex,
    text: chunkText,
  }));
}

/** Cursor-paginated ListResponse walker ({ list, pageInfo { endCursor hasNextPage } }). */
async function walkCursorList(
  gql: GqlExec,
  buildQuery: (cursor: string | null) => {
    query: string;
    variables: Record<string, unknown>;
  },
  extract: (data: GqlData) => {
    list: GqlData[];
    pageInfo?: { endCursor?: string; hasNextPage?: boolean };
  },
  max: number,
): Promise<GqlData[]> {
  const out: GqlData[] = [];
  let cursor: string | null = null;

  for (;;) {
    const { query, variables } = buildQuery(cursor);
    const data = await gql(query, variables);
    const { list, pageInfo } = extract(data);
    out.push(...(list || []));
    if (max > 0 && out.length >= max) return out.slice(0, max);
    if (!pageInfo?.hasNextPage || !pageInfo?.endCursor || !(list || []).length)
      return out;
    cursor = pageInfo.endCursor;
  }
}

/** Generic detail-query post-filter: id allowed iff the query returns the record. */
function detailAllowedIds(
  detailQuery: string,
  rootField: string,
  extraCheck?: (doc: GqlData) => boolean,
) {
  return async (gql: GqlExec, ids: string[]): Promise<Set<string>> => {
    const allowed = new Set<string>();
    await Promise.all(
      ids.map(async (id) => {
        try {
          const data = await gql(detailQuery, { _id: id });
          const doc = data?.[rootField];
          if (doc?._id && (!extraCheck || extraCheck(doc))) {
            allowed.add(String(doc._id));
          }
        } catch {
          // fail closed: errors (denied, missing, plugin down) = not allowed
        }
      }),
    );
    return allowed;
  };
}

const PAGE = 100;

// ── Registry entries ─────────────────────────────────────────────────────────

const kbArticle: KnowledgeContentType = {
  type: 'kb-article',
  plugin: 'frontline',
  list: async (gql, max) => {
    const out: KnowledgeRecord[] = [];
    for (let page = 1; ; page++) {
      const data = await gql(
        `query KnowledgeSweepKb($page: Int, $perPage: Int, $status: String) {
          knowledgeBaseArticles(page: $page, perPage: $perPage, status: $status) {
            _id title summary content status isPrivate modifiedDate
          }
        }`,
        { page, perPage: PAGE, status: 'publish' },
      );
      const batch: GqlData[] = data.knowledgeBaseArticles || [];
      for (const article of batch) {
        if (article.status !== 'publish' || article.isPrivate) continue;
        out.push({
          _id: article._id,
          title: article.title || '',
          chunks: articleToChunks(article),
          modifiedDate: toIso(article.modifiedDate),
        });
      }
      if (batch.length < PAGE || (max > 0 && out.length >= max)) break;
    }
    return max > 0 ? out.slice(0, max) : out;
  },
  // Batch by-ids fetch; only published + public articles count as visible.
  allowedIds: async (gql, ids) => {
    const data = await gql(
      `query KnowledgeVerifyKb($articleIds: [String], $perPage: Int) {
        knowledgeBaseArticles(articleIds: $articleIds, perPage: $perPage) { _id status isPrivate }
      }`,
      { articleIds: ids, perPage: ids.length },
    );
    return new Set(
      (data.knowledgeBaseArticles || [])
        .filter(
          (article: GqlData) =>
            article.status === 'publish' && !article.isPrivate,
        )
        .map((article: GqlData) => String(article._id)),
    );
  },
};

const customer: KnowledgeContentType = {
  type: 'customer',
  plugin: 'core',
  list: async (gql, max) => {
    const docs = await walkCursorList(
      gql,
      (cursor) => ({
        query: `query KnowledgeSweepCustomers($limit: Int, $cursor: String) {
          customers(limit: $limit, cursor: $cursor) {
            list { _id firstName lastName primaryEmail primaryPhone position description code state updatedAt }
            pageInfo { endCursor hasNextPage }
          }
        }`,
        variables: { limit: PAGE, cursor },
      }),
      (data) => data.customers || { list: [] },
      max,
    );
    return docs.map((customerDoc) => {
      const name =
        [customerDoc.firstName, customerDoc.lastName]
          .filter(Boolean)
          .join(' ') ||
        customerDoc.primaryEmail ||
        customerDoc._id;
      return {
        _id: customerDoc._id,
        title: `Customer: ${name}`,
        chunks: linesToChunks(`Customer: ${name}`, [
          ['Email', customerDoc.primaryEmail],
          ['Phone', customerDoc.primaryPhone],
          ['Position', customerDoc.position],
          ['State', customerDoc.state],
          ['Code', customerDoc.code],
          ['Notes', htmlToText(customerDoc.description || '')],
        ]),
        modifiedDate: toIso(customerDoc.updatedAt),
      };
    });
  },
  allowedIds: detailAllowedIds(
    'query KnowledgeVerifyCustomer($_id: String!) { customerDetail(_id: $_id) { _id } }',
    'customerDetail',
  ),
};

const company: KnowledgeContentType = {
  type: 'company',
  plugin: 'core',
  list: async (gql, max) => {
    const docs = await walkCursorList(
      gql,
      (cursor) => ({
        query: `query KnowledgeSweepCompanies($limit: Int, $cursor: String) {
          companies(limit: $limit, cursor: $cursor) {
            list { _id primaryName primaryEmail description updatedAt }
            pageInfo { endCursor hasNextPage }
          }
        }`,
        variables: { limit: PAGE, cursor },
      }),
      (data) => data.companies || { list: [] },
      max,
    );
    return docs.map((companyDoc) => ({
      _id: companyDoc._id,
      title: `Company: ${companyDoc.primaryName || companyDoc._id}`,
      chunks: linesToChunks(
        `Company: ${companyDoc.primaryName || companyDoc._id}`,
        [
          ['Email', companyDoc.primaryEmail],
          ['Notes', htmlToText(companyDoc.description || '')],
        ],
      ),
      modifiedDate: toIso(companyDoc.updatedAt),
    }));
  },
  allowedIds: detailAllowedIds(
    'query KnowledgeVerifyCompany($_id: String!) { companyDetail(_id: $_id) { _id } }',
    'companyDetail',
  ),
};

const product: KnowledgeContentType = {
  type: 'product',
  plugin: 'core',
  list: async (gql, max) => {
    const out: KnowledgeRecord[] = [];
    for (let page = 1; ; page++) {
      const data = await gql(
        `query KnowledgeSweepProducts($page: Int, $perPage: Int) {
          products(page: $page, perPage: $perPage) {
            _id name shortName code description status createdAt
          }
        }`,
        { page, perPage: PAGE },
      );
      const batch: GqlData[] = data.products || [];
      for (const productDoc of batch) {
        if (productDoc.status === 'deleted') continue;
        out.push({
          _id: productDoc._id,
          title: `Product: ${
            productDoc.name || productDoc.code || productDoc._id
          }`,
          chunks: linesToChunks(
            `Product: ${productDoc.name || productDoc._id}`,
            [
              ['Short name', productDoc.shortName],
              ['Code', productDoc.code],
              ['Description', htmlToText(productDoc.description || '')],
            ],
          ),
          // Products expose no updatedAt through GraphQL; createdAt means
          // edits re-embed only via the periodic full re-list (acceptable).
          modifiedDate: toIso(productDoc.createdAt),
        });
      }
      if (batch.length < PAGE || (max > 0 && out.length >= max)) break;
    }
    return max > 0 ? out.slice(0, max) : out;
  },
  allowedIds: detailAllowedIds(
    'query KnowledgeVerifyProduct($_id: String) { productDetail(_id: $_id) { _id status } }',
    'productDetail',
    (productDoc) => productDoc.status !== 'deleted',
  ),
};

const deal: KnowledgeContentType = {
  type: 'deal',
  plugin: 'sales',
  list: async (gql, max) => {
    const docs = await walkCursorList(
      gql,
      (cursor) => ({
        query: `query KnowledgeSweepDeals($limit: Int, $cursor: String) {
          deals(limit: $limit, cursor: $cursor) {
            list { _id name description status modifiedAt }
            pageInfo { endCursor hasNextPage }
          }
        }`,
        variables: { limit: PAGE, cursor },
      }),
      (data) => data.deals || { list: [] },
      max,
    );
    return docs
      .filter((dealDoc) => dealDoc.status !== 'archived')
      .map((dealDoc) => ({
        _id: dealDoc._id,
        title: `Deal: ${dealDoc.name || dealDoc._id}`,
        chunks: linesToChunks(`Deal: ${dealDoc.name || dealDoc._id}`, [
          ['Status', dealDoc.status],
          ['Description', htmlToText(dealDoc.description || '')],
        ]),
        modifiedDate: toIso(dealDoc.modifiedAt),
      }));
  },
  allowedIds: detailAllowedIds(
    'query KnowledgeVerifyDeal($_id: String!) { dealDetail(_id: $_id) { _id status } }',
    'dealDetail',
    (dealDoc) => dealDoc.status !== 'archived',
  ),
};

const task: KnowledgeContentType = {
  type: 'task',
  plugin: 'operation',
  list: async (gql, max) => {
    const docs = await walkCursorList(
      gql,
      (cursor) => ({
        query: `query KnowledgeSweepTasks($filter: ITaskFilter) {
          getTasks(filter: $filter) {
            list { _id name description status updatedAt }
            pageInfo { endCursor hasNextPage }
          }
        }`,
        variables: { filter: { limit: PAGE, ...(cursor ? { cursor } : {}) } },
      }),
      (data) => data.getTasks || { list: [] },
      max,
    );
    return docs.map((taskDoc) => ({
      _id: taskDoc._id,
      title: `Task: ${taskDoc.name || taskDoc._id}`,
      chunks: linesToChunks(`Task: ${taskDoc.name || taskDoc._id}`, [
        ['Status', taskDoc.status],
        ['Description', htmlToText(taskDoc.description || '')],
      ]),
      modifiedDate: toIso(taskDoc.updatedAt),
    }));
  },
  allowedIds: detailAllowedIds(
    'query KnowledgeVerifyTask($_id: String!) { getTask(_id: $_id) { _id } }',
    'getTask',
  ),
};

const conversation: KnowledgeContentType = {
  type: 'conversation',
  plugin: 'frontline',
  list: async (gql, max) => {
    const docs = await walkCursorList(
      gql,
      (cursor) => ({
        query: `query KnowledgeSweepConversations($limit: Int, $cursor: String) {
          conversations(limit: $limit, cursor: $cursor) {
            list { _id content status updatedAt createdAt }
            pageInfo { endCursor hasNextPage }
          }
        }`,
        variables: { limit: PAGE, cursor },
      }),
      (data) => data.conversations || { list: [] },
      max,
    );
    return docs
      .filter((convDoc) => htmlToText(convDoc.content || '').trim())
      .map((convDoc) => ({
        _id: convDoc._id,
        title: `Conversation ${convDoc._id}`,
        chunks: linesToChunks(
          `Customer conversation (status: ${convDoc.status || 'unknown'})`,
          [['Content', htmlToText(convDoc.content || '')]],
        ),
        modifiedDate: toIso(convDoc.updatedAt || convDoc.createdAt),
      }));
  },
  allowedIds: detailAllowedIds(
    'query KnowledgeVerifyConversation($_id: String!) { conversationDetail(_id: $_id) { _id } }',
    'conversationDetail',
  ),
};

export const KNOWLEDGE_CONTENT_TYPES: Record<string, KnowledgeContentType> = {
  'kb-article': kbArticle,
  customer,
  company,
  product,
  deal,
  task,
  conversation,
};

export const ALL_KNOWLEDGE_TYPE_NAMES = Object.keys(KNOWLEDGE_CONTENT_TYPES);
