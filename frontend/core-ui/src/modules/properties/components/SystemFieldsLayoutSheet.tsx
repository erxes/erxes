import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  usePagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  buildLayoutRows,
  isWideType,
  LayoutEditor,
  useSystemFieldsLayout,
  RecordSidePanel,
} from 'ui-modules';
import { usePropertySystemFields } from '@/properties/hooks/usePropertySystemFields';
import { useSystemFieldsLayoutSave } from '@/properties/hooks/useSystemFieldsLayoutSave';
export const SystemFieldsLayoutSheet = ({
  contentType,
  open,
  onClose,
}: {
  contentType: string;
  open: boolean;
  onClose: () => void;
}) => {
  const pagePanel = usePagePanel({
    name: 'properties/SystemFieldsLayoutSheet',
    open: open,
    onOpenChange: (next) => !next && onClose(),
  });
  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded && pagePanel.allowed ? (
        <SystemFieldsLayoutEditor contentType={contentType} onClose={onClose} />
      ) : (
        <PagePanelStatus entry={pagePanel} />
      )}
    </div>,
    pagePanel,
  );
};
const SystemFieldsLayoutEditor = ({
  contentType,
  onClose,
}: {
  contentType: string;
  onClose: () => void;
}) => {
  const pagePanel = usePagePanelContext();
  const { t } = useTranslation('settings', {
    keyPrefix: 'properties',
  });
  const { systemFields, loading } = usePropertySystemFields(contentType);
  const { layout, loading: layoutLoading } = useSystemFieldsLayout(contentType);
  const { save, loading: saving } = useSystemFieldsLayoutSave(
    contentType,
    onClose,
  );
  if (loading || layoutLoading) {
    return <Spinner containerClassName="py-12" />;
  }
  const placeable = systemFields.filter((field) => !field.outsideLayout);
  return (
    <>
      <RecordSidePanel.Header
        title={`${t('layout', 'Layout')} — ${t(
          'basic-information',
          'Basic information',
        )}`}
        {...pagePanel.headerProps}
      />
      <LayoutEditor
        title={`${t('layout', 'Layout')} — ${t(
          'basic-information',
          'Basic information',
        )}`}
        items={placeable.map((field) => ({
          id: field.code,
          name: field.name,
          dimmed: !field.isVisible,
        }))}
        // The saved or declared layout, with any field it misses placed below.
        initialRows={buildLayoutRows({
          layout,
          items: placeable,
          getId: (field) => field.code,
          isWide: (field) => isWideType(field.type),
        }).map((row) => row.items.map((field) => field.code))}
        saving={saving}
        onSave={save}
        onClose={onClose}
        layout="record"
      />
    </>
  );
};
