import { IFavoritesDocument } from '@/organization/settings/db/definitions/favorites';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

type FavoriteWithBreadcrumb = Omit<
  IFavoritesDocument,
  'breadcrumb' | 'toObject'
> & {
  breadcrumb?: string[];
  toObject?: () => Record<string, unknown>;
};

type ResolvedFavorite = Record<string, unknown> & {
  breadcrumb: string[];
  path: string;
};

type OperationTeamMatch = {
  teamId: string;
  moduleName: string;
};

type SalesDealMatch = {
  boardId?: string;
  pipelineId?: string;
};

type SalesFavoriteNames = {
  boards?: Record<string, string>;
  pipelines?: Record<string, string>;
};

const operationTeamPathPattern =
  /^\/operation\/team\/([^/]+)\/(projects|tasks|cycles|triage)$/;

const operationStaticBreadcrumbs: Record<string, string[]> = {
  '/operation/projects': ['Operation', 'Projects'],
  '/operation/tasks': ['Operation', 'Tasks', 'Assigned'],
  '/operation/tasks/created': ['Operation', 'Tasks', 'Created'],
};

const operationModuleLabels: Record<string, string> = {
  projects: 'Projects',
  tasks: 'Tasks',
  cycles: 'Cycles',
  triage: 'Triage',
};

const salesDealPaths = new Set(['/sales/deal', '/sales/deals']);

const titleize = (value: string) => {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const normalizeFavoritePath = (path: string) => {
  const trimmedPath = path.trim();

  if (!trimmedPath) {
    return '/';
  }

  try {
    const url = new URL(trimmedPath);
    return `${url.pathname}${url.search}`.replace(/\/$/, '') || '/';
  } catch {
    return trimmedPath.replace(/\/$/, '') || '/';
  }
};

const getPathWithoutQuery = (path: string) => {
  return normalizeFavoritePath(path).split(/[?#]/)[0] || '/';
};

const matchOperationTeamPath = (path: string): OperationTeamMatch | null => {
  const match = getPathWithoutQuery(path).match(operationTeamPathPattern);

  if (!match) {
    return null;
  }

  return {
    teamId: match[1],
    moduleName: match[2],
  };
};

const matchSalesDealPath = (path: string): SalesDealMatch | null => {
  const normalizedPath = normalizeFavoritePath(path);
  const [pathname, query = ''] = normalizedPath.split('?');

  if (!salesDealPaths.has(pathname)) {
    return null;
  }

  const searchParams = new URLSearchParams(query);

  return {
    boardId: searchParams.get('boardId') || undefined,
    pipelineId: searchParams.get('pipelineId') || undefined,
  };
};

const fallbackBreadcrumb = (path: string) => {
  const segments = getPathWithoutQuery(path).split('/').filter(Boolean);

  if (!segments.length) {
    return ['Unknown'];
  }

  return segments.slice(0, 3).map(titleize);
};

const getOperationTeamNames = async ({
  subdomain,
  teamIds,
}: {
  subdomain: string;
  teamIds: string[];
}) => {
  if (!teamIds.length) {
    return {};
  }

  return (await sendTRPCMessage({
    subdomain,
    pluginName: 'operation',
    module: 'favorites',
    action: 'resolveTeamNames',
    input: { teamIds },
    defaultValue: {},
  })) as Record<string, string>;
};

const getSalesFavoriteNames = async ({
  subdomain,
  boardIds,
  pipelineIds,
}: {
  subdomain: string;
  boardIds: string[];
  pipelineIds: string[];
}) => {
  const emptyNames: SalesFavoriteNames = { boards: {}, pipelines: {} };

  if (!boardIds.length && !pipelineIds.length) {
    return emptyNames;
  }

  return (await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    module: 'favorites',
    action: 'resolveBoardPipelineNames',
    input: { boardIds, pipelineIds },
    defaultValue: emptyNames,
  })) as SalesFavoriteNames;
};

const buildSalesDealBreadcrumb = (
  salesDealMatch: SalesDealMatch,
  salesFavoriteNames: SalesFavoriteNames,
) => {
  const breadcrumb = ['Sales Pipeline'];

  if (salesDealMatch.boardId) {
    breadcrumb.push(
      salesFavoriteNames.boards?.[salesDealMatch.boardId] || 'Unknown',
    );
  }

  if (salesDealMatch.pipelineId) {
    breadcrumb.push(
      salesFavoriteNames.pipelines?.[salesDealMatch.pipelineId] || 'Unknown',
    );
  }

  return breadcrumb.slice(0, 3);
};

const toFavoriteObject = (favorite: FavoriteWithBreadcrumb) => {
  if (typeof favorite.toObject === 'function') {
    return favorite.toObject();
  }

  return favorite;
};

export const resolveFavoritesBreadcrumbs = async ({
  favorites,
  subdomain,
}: {
  favorites: FavoriteWithBreadcrumb[];
  subdomain: string;
}): Promise<ResolvedFavorite[]> => {
  const operationTeamIds = Array.from(
    new Set(
      favorites
        .map((favorite) => matchOperationTeamPath(favorite.path)?.teamId)
        .filter((teamId): teamId is string => Boolean(teamId)),
    ),
  );

  const salesDealMatches = favorites
    .map((favorite) => matchSalesDealPath(favorite.path))
    .filter((match): match is SalesDealMatch => Boolean(match));

  const salesBoardIds = Array.from(
    new Set(
      salesDealMatches
        .map((match) => match.boardId)
        .filter((boardId): boardId is string => Boolean(boardId)),
    ),
  );

  const salesPipelineIds = Array.from(
    new Set(
      salesDealMatches
        .map((match) => match.pipelineId)
        .filter((pipelineId): pipelineId is string => Boolean(pipelineId)),
    ),
  );

  const [operationTeamNames, salesFavoriteNames] = await Promise.all([
    getOperationTeamNames({
      subdomain,
      teamIds: operationTeamIds,
    }),
    getSalesFavoriteNames({
      subdomain,
      boardIds: salesBoardIds,
      pipelineIds: salesPipelineIds,
    }),
  ]);

  return favorites.map((favorite) => {
    const favoriteObject = toFavoriteObject(favorite);
    const path = normalizeFavoritePath(favorite.path);
    const operationTeamMatch = matchOperationTeamPath(path);
    const salesDealMatch = matchSalesDealPath(path);

    if (operationTeamMatch) {
      return {
        ...favoriteObject,
        path,
        breadcrumb: [
          'Operation',
          operationTeamNames[operationTeamMatch.teamId] || 'Unknown',
          operationModuleLabels[operationTeamMatch.moduleName] || 'Unknown',
        ],
      };
    }

    if (salesDealMatch) {
      return {
        ...favoriteObject,
        path,
        breadcrumb: buildSalesDealBreadcrumb(
          salesDealMatch,
          salesFavoriteNames,
        ),
      };
    }

    return {
      ...favoriteObject,
      path,
      breadcrumb:
        operationStaticBreadcrumbs[getPathWithoutQuery(path)] ||
        fallbackBreadcrumb(path),
    };
  });
};
