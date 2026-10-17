import {
  IconArrowUpRight,
  IconBriefcase,
  IconBuilding,
  IconBuildingStore,
  IconCategory,
  IconChessKnight,
  IconHierarchy,
  IconInbox,
  IconShoppingCart,
  IconUser,
  type Icon,
} from '@tabler/icons-react';

import type { ApolloClient } from '@apollo/client';

import { AGENTS_DEAL_REFERENCE_TARGET } from '../graphql/references';
import {
  AGENT_REFERENCE_ID_RE,
  type TAgentReferenceType,
} from './parseAgentReferences';

/**
 * Where a record reference points: the record page path, its icon, the
 * i18n label key, the plugin that must be loaded for the target to exist,
 * and the permission module the user needs to open it.
 *
 * Paths mirror `CORE_RESULT_PATHS` in
 * `modules/search/providers/coreSearchProviders.ts`; they are kept local
 * (not imported) because that map is keyed by search node module names,
 * not reference types, and the agent registry also carries plugin
 * availability and permission metadata the search map does not have.
 */
export interface IAgentReferenceTarget {
  type: TAgentReferenceType;
  icon: Icon;
  /** Label under the `common:agent.reference-types` i18n group. */
  labelKey: string;
  /**
   * Target module in `usePermissionCheck().hasModulePermission`. Empty for
   * `page`: its navigability comes from the client catalog instead.
   */
  permissionModule?: string;
  /**
   * Module Federation remote that must be loaded for the record page to
   * exist. Core pages need none; `sales`/`frontline` come from plugins.
   */
  pluginRemote?: 'sales_ui' | 'frontline_ui';
  path: (id: string) => string;
  /**
   * Optional async upgrade of `path(id)` — used when the record's URL
   * needs parameters only the server knows (a deal's board/pipeline).
   * Receives the RAW reference id and the Apollo client; returning null
   * or throwing makes the chip fall back to `path(id)`.
   */
  resolvePath?: (
    id: string,
    client: ApolloClient<object>,
  ) => Promise<string | null>;
}

export const AGENT_REFERENCE_TARGETS: Record<
  TAgentReferenceType,
  IAgentReferenceTarget
> = {
  customer: {
    type: 'customer',
    icon: IconUser,
    labelKey: 'customer',
    permissionModule: 'contacts',
    path: (id) => `/contacts/customers?contactId=${id}`,
  },
  company: {
    type: 'company',
    icon: IconBuilding,
    labelKey: 'company',
    permissionModule: 'contacts',
    path: (id) => `/contacts/companies?companyId=${id}`,
  },
  user: {
    type: 'user',
    icon: IconUser,
    labelKey: 'user',
    permissionModule: 'teamMembers',
    path: (id) => `/settings/team/members?user_id=${id}`,
  },
  product: {
    type: 'product',
    icon: IconShoppingCart,
    labelKey: 'product',
    permissionModule: 'products',
    path: (id) => `/settings/products?product_id=${id}`,
  },
  branch: {
    type: 'branch',
    icon: IconBuildingStore,
    labelKey: 'branch',
    permissionModule: 'organization',
    path: (id) => `/settings/structures/branches?branch_id=${id}`,
  },
  department: {
    type: 'department',
    icon: IconHierarchy,
    labelKey: 'department',
    permissionModule: 'organization',
    path: (id) => `/settings/structures/departments?department_id=${id}`,
  },
  unit: {
    type: 'unit',
    icon: IconCategory,
    labelKey: 'unit',
    permissionModule: 'organization',
    path: (id) => `/settings/structures/units?unit_id=${id}`,
  },
  brand: {
    type: 'brand',
    icon: IconChessKnight,
    labelKey: 'brand',
    permissionModule: 'brands',
    path: (id) => `/settings/brands?brand_id=${id}`,
  },
  deal: {
    type: 'deal',
    icon: IconBriefcase,
    labelKey: 'deal',
    permissionModule: 'deal',
    pluginRemote: 'sales_ui',
    path: (id) => `/sales/deals?salesItemId=${id}`,
    /**
     * The sales board page appends its default board/pipeline when the
     * link carries only `salesItemId` — opening the deal on the wrong
     * (usually empty) pipeline. Resolve them the same way the sales
     * search provider does: `boardId` first, `pipeline.boardId` as the
     * fallback, `pipeline._id` as the pipeline param.
     */
    resolvePath: async (id, client) => {
      const { data } = await client.query<{
        dealDetail?: {
          boardId?: string | null;
          pipeline?: { _id?: string | null; boardId?: string | null } | null;
        } | null;
      }>({
        query: AGENTS_DEAL_REFERENCE_TARGET,
        variables: { _id: id },
        fetchPolicy: 'cache-first',
      });

      const deal = data?.dealDetail;
      const boardId = deal?.boardId ?? deal?.pipeline?.boardId;
      const pipelineId = deal?.pipeline?._id;
      if (!boardId || !pipelineId) return null;
      return `/sales/deals?boardId=${boardId}&pipelineId=${pipelineId}&salesItemId=${encodeURIComponent(id)}`;
    },
  },
  conversation: {
    type: 'conversation',
    icon: IconInbox,
    labelKey: 'conversation',
    permissionModule: 'inbox',
    pluginRemote: 'frontline_ui',
    path: (id) => `/frontline/inbox?conversationId=${id}`,
  },
  page: {
    type: 'page',
    icon: IconArrowUpRight,
    labelKey: 'page',
    /**
     * `path(id)` is never used — the chip decodes the base64url token id
     * itself and navigates only when the decoded path is a known catalog
     * page (never an invented one).
     */
    path: () => '/',
  },
};

/** Reject control characters in a decoded page path. */
// eslint-disable-next-line no-control-regex
const PAGE_PATH_BAD_CHAR_RE = /[\x00-\x1f\x7f]/;

/**
 * Decodes a `[[page:<base64url>:<label>]]` token's id back into a client
 * path. Returns null on malformed input — the caller renders the plain
 * pill so a garbage token can never navigate anywhere.
 */
export const decodeAgentPagePath = (encoded: string): string | null => {
  if (!AGENT_REFERENCE_ID_RE.test(encoded)) return null;

  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    // UTF-8 decode without TextDecoder: escape each byte, then URI-decode.
    // Malformed byte sequences throw inside decodeURIComponent → null.
    let escaped = '';
    for (let i = 0; i < binary.length; i++) {
      escaped += `%${binary.charCodeAt(i).toString(16).padStart(2, '0')}`;
    }
    const path = decodeURIComponent(escaped);

    if (!path.startsWith('/') || PAGE_PATH_BAD_CHAR_RE.test(path)) {
      return null;
    }
    return path;
  } catch {
    return null;
  }
};

/** Resolves whether a reference target is navigable for the current user. */
export const getAgentReferenceTarget = (type: TAgentReferenceType) =>
  AGENT_REFERENCE_TARGETS[type];
