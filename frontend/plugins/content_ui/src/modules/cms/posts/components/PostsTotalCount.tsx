import { useAtomValue } from 'jotai';
import { CmsRecordCount } from '~/modules/cms/shared/components/CmsRecordCount';
import { postsTotalCountAtom } from '../states/postsCounts';

export const PostsTotalCount = () => {
  const totalCount = useAtomValue(postsTotalCountAtom);
  return <CmsRecordCount totalCount={totalCount} />;
};
