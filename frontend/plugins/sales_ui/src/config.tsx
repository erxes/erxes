import { IconBriefcase, IconReceipt, IconSandbox } from '@tabler/icons-react';
import { Suspense, lazy } from 'react';

import {
  IUIConfig,
  TFavoriteNameProps,
  TFavoritePathProps,
  TPropertyInputProps,
} from 'erxes-ui';
import { usePipelineDetail } from '@/deals/boards/hooks/usePipelines';

const DealStagePropertyInput = lazy(() =>
  import('./modules/deals/components/deal-selects/DealStagePropertyInput').then(
    (module) => ({
      default: module.DealStagePropertyInput,
    }),
  ),
);

const MainNavigation = lazy(() =>
  import('./modules/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);

const SalesSubNavigation = lazy(() =>
  import('./modules/SalesSubNavigation').then((module) => ({
    default: module.SalesSubNavigation,
  })),
);

const PosOrderNavigation = lazy(() =>
  import('./modules/pos/PosOrderNavigation').then((module) => ({
    default: module.PosOrderNavigation,
  })),
);

const SalesSettingsNavigation = lazy(() =>
  import('./modules/SalesSettingsNavigation').then((module) => ({
    default: module.SalesSettingsNavigation,
  })),
);

const getSalesFavoriteName = (path: string) => {
  const pathWithoutQuery = path.split('?')[0].replace(/^\/|\/$/g, '');

  if (pathWithoutQuery === 'sales/deals') return 'Sales / Deals';
  if (pathWithoutQuery === 'sales/pos') return 'Sales / POS';

  if (pathWithoutQuery.endsWith('/orders')) return 'POS / Orders';
  if (pathWithoutQuery.endsWith('/covers')) return 'POS / Covers';
  if (pathWithoutQuery.endsWith('/by-items')) return 'POS / By Items';
  if (pathWithoutQuery.endsWith('/items')) return 'POS / Items';
  if (pathWithoutQuery.endsWith('/summary')) return 'POS / Summary';
  if (pathWithoutQuery.endsWith('/orders-by-customer')) {
    return 'POS / Customers';
  }

  if (pathWithoutQuery.endsWith('/orders-by-subscription')) {
    return 'POS / Subscriptions';
  }

  return 'Sales';
};

const getSalesFavoriteParam = (path: string, paramName: string) => {
  const queryString = path.split('?')[1] || '';

  return new URLSearchParams(queryString).get(paramName);
};

const getSalesDealsFavoritePath = ({
  pathname,
  search,
}: TFavoritePathProps) => {
  const searchParams = new URLSearchParams(search);
  const boardId = searchParams.get('boardId');
  const pipelineId = searchParams.get('pipelineId');
  const favoriteParams = new URLSearchParams();

  if (boardId) favoriteParams.set('boardId', boardId);
  if (pipelineId) favoriteParams.set('pipelineId', pipelineId);

  const queryString = favoriteParams.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
};

const SalesDealsFavoriteName = ({ path }: TFavoriteNameProps) => {
  const pipelineId = getSalesFavoriteParam(path, 'pipelineId');

  if (pipelineId) return <SalesPipelineFavoriteName pipelineId={pipelineId} />;

  return 'Deals';
};

const SalesPipelineFavoriteName = ({ pipelineId }: { pipelineId: string }) => {
  const { pipelineDetail } = usePipelineDetail({
    variables: { _id: pipelineId },
  });

  if (!pipelineDetail?.name) return 'Deals';

  return `${pipelineDetail.name} / Deals`;
};

export const CONFIG: IUIConfig = {
  name: 'sales',
  path: 'sales',
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <SalesSettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: 'sales',
    icon: IconBriefcase,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
    subGroup: () => (
      <Suspense fallback={<div />}>
        <SalesSubNavigation />
        <PosOrderNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'sales',
      icon: IconBriefcase,
      path: 'sales',
      favoriteName: getSalesFavoriteName,
      hasAutomation: true,
    },
    {
      name: 'deals',
      path: 'sales/deals',
      favoriteName: getSalesFavoriteName,
      favoriteNameComponent: SalesDealsFavoriteName,
      favoritePath: getSalesDealsFavoritePath,
    },
    {
      name: 'pos',
      icon: IconBriefcase,
      path: 'sales/pos',
      favoriteName: getSalesFavoriteName,
    },
  ],
  widgets: {
    relationWidgets: [
      {
        name: 'deals',
        icon: IconSandbox,
      },
      {
        name: 'posOrders',
        icon: IconReceipt,
      },
    ],
    propertyInputs: {
      dealStage: (props: TPropertyInputProps) => (
        <Suspense fallback={<div />}>
          <DealStagePropertyInput {...props} />
        </Suspense>
      ),
    },
  },
};
