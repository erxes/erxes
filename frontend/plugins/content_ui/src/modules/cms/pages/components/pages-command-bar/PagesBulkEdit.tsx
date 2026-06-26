import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBulkEditPages } from '../../hooks/useBulkEditPages';
import { usePages } from '../../hooks/usePages';
import { STATUS_DATA } from '@/cms/posts/constants/statusData';
import { BulkEditWithStatusAndParent } from '@/cms/shared/components/BulkEditWithStatusAndParent';

export const PagesBulkEdit = ({ clientPortalId }: { clientPortalId: string }) => {
  const { t } = useTranslation('content');
  const [currentContent, setCurrentContent] = useState('main');

  const { bulkEditPages, loading } = useBulkEditPages();

  const { pages, loading: pagesLoading } = usePages({
    variables: { clientPortalId },
    skip: currentContent !== 'parent',
  });

  return (
    <BulkEditWithStatusAndParent
      loading={loading}
      statusItems={STATUS_DATA}
      parentItems={pages}
      parentLoading={pagesLoading}
      parentSearchPlaceholder={t('search-pages')}
      onBulkEdit={(ids, input) => bulkEditPages(ids, input)}
      onContentChange={setCurrentContent}
    />
  );
};
