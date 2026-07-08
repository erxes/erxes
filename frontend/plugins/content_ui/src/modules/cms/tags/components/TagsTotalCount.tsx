import { useAtomValue } from 'jotai';
import { CmsRecordCount } from '~/modules/cms/shared/components/CmsRecordCount';
import { tagsTotalCountAtom } from '../states/tagsCounts';

export const TagsTotalCount = () => {
  const totalCount = useAtomValue(tagsTotalCountAtom);
  return <CmsRecordCount totalCount={totalCount} />;
};
