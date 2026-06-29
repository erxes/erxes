import { useAtomValue } from 'jotai';
import { CmsRecordCount } from '~/modules/cms/shared/components/CmsRecordCount';
import { pagesTotalCountAtom } from '../states/pagesCounts';

export const PagesTotalCount = () => {
  const totalCount = useAtomValue(pagesTotalCountAtom);
  return <CmsRecordCount totalCount={totalCount} />;
};
