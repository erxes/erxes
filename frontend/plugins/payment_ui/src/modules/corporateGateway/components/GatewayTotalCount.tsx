import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import {
  golomtConfigsCountAtom,
  khanbankConfigsCountAtom,
  tdbConfigsCountAtom,
} from '~/modules/corporateGateway/states/gatewayCounts';

export const GatewayTotalCount = () => {
  const { t } = useTranslation('payment');
  const golomtCount = useAtomValue(golomtConfigsCountAtom);
  const khanbankCount = useAtomValue(khanbankConfigsCountAtom);
  const tdbCount = useAtomValue(tdbConfigsCountAtom);

  const loading = [golomtCount, khanbankCount, tdbCount].some(
    isUndefinedOrNull,
  );

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {loading ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        t('records-found', {
          count: (golomtCount || 0) + (khanbankCount || 0) + (tdbCount || 0),
        })
      )}
    </div>
  );
};
