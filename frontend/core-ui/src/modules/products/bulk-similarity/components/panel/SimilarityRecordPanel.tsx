import { IconLayoutGrid } from '@tabler/icons-react';
import { Button, Empty, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type IRecordViewProps,
  RecordSidePanel,
  usePanelExpanded,
  usePermissionCheck,
  useSidePanel,
} from 'ui-modules';
import { ContactPanelIdentity } from '@/side-panel/components/details/ContactPanelActions';
import { ProductPanelBreadcrumb } from '@/products/product-detail/components/panel/ProductPanelBreadcrumb';
import { ProductsPath } from '@/types/paths/ProductsPath';
import { useEditSimilarity } from '../../hooks/useEditSimilarity';
import { useProductSimilarity } from '../../hooks/useProductSimilarityDetail';
import { IBulkSaveInput } from '../../types';
import { SimilarityPanelActions } from './SimilarityPanelActions';
import { SimilarityPanelForm } from './SimilarityPanelForm';

/**
 * A similarity group in the app's side panel
 * (`?panel=/detail/core:productSimilarity/<id>`): its shared product info,
 * images, variant fields and generated products as tabs. Save regenerates
 * the group's products, so changes wait for it. Expanded, it is the group's
 * own page. Without `productsUpdate` it is shown read-only.
 */
export const SimilarityRecordPanel = ({
  record,
  onBack,
  onClose,
}: IRecordViewProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const similarityId = record.contentId;
  const { hasActionPermission } = usePermissionCheck();
  const { similarity, loading, error, refetch } =
    useProductSimilarity(similarityId);
  const { edit, loading: saving } = useEditSimilarity();
  const { tab, setTab, dismissPath, path } = useSidePanel();
  const expanded = usePanelExpanded();
  // A new form reads the saved group: after Save, and to put values back.
  const [version, setVersion] = useState(0);

  const title = t('similarity-detail', 'Similarity group');

  const header = (
    <RecordSidePanel.Header
      className={expanded ? 'h-10 bg-background px-3' : undefined}
      title={
        expanded ? (
          <ProductPanelBreadcrumb
            title={similarity?.info?.name || title}
            to={ProductsPath.Similarities}
            label={t('similarities', 'Similarities')}
            icon={IconLayoutGrid}
          />
        ) : (
          title
        )
      }
      actions={
        similarity && (
          <SimilarityPanelActions
            similarityId={similarity._id}
            // On its own page it goes back to the list; in the panel, to the
            // record before it.
            onDeleted={() =>
              !expanded && path ? dismissPath(path) : onClose()
            }
          />
        )
      }
      onBack={onBack}
      onClose={onClose}
    />
  );

  if (loading && !similarity) {
    return (
      <>
        {header}
        <Spinner containerClassName="py-12" />
      </>
    );
  }

  if (!similarity) {
    return (
      <>
        {header}
        <Empty className="py-12">
          <Empty.Header>
            <Empty.Title>
              {error
                ? t('load-failed', 'Could not load the similarity group')
                : t('not-found', 'Similarity group not found')}
            </Empty.Title>
            {error && <Empty.Description>{error.message}</Empty.Description>}
          </Empty.Header>
          {error && (
            <Empty.Content>
              <Button onClick={() => refetch()}>{t('retry', 'Retry')}</Button>
            </Empty.Content>
          )}
        </Empty>
      </>
    );
  }

  const save = async (doc: IBulkSaveInput) => {
    await edit(similarity._id, doc);
    setVersion((current) => current + 1);
  };

  return (
    <>
      {header}
      <SimilarityPanelForm
        key={`${similarity._id}-${version}`}
        similarity={similarity}
        tab={tab || 'detail'}
        onTabChange={setTab}
        overviewHeader={
          <ContactPanelIdentity title={t('details', 'Details')} />
        }
        saving={saving}
        onSave={save}
        onCancel={() => setVersion((current) => current + 1)}
        cancelLabel={t('discard', 'Discard changes')}
        saveLabel={t('save')}
        readOnlyReason={
          hasActionPermission('productsUpdate')
            ? null
            : t(
                'no-update-permission',
                'You can view this similarity group but not edit it.',
              )
        }
      />
    </>
  );
};
