import { useAtomValue } from 'jotai';
import { CmsRecordCount } from '~/modules/cms/shared/components/CmsRecordCount';
import { categoriesTotalCountAtom } from '../states/categoriesCounts';

export const CategoriesTotalCount = () => {
  const totalCount = useAtomValue(categoriesTotalCountAtom);
  return <CmsRecordCount totalCount={totalCount} />;
};
