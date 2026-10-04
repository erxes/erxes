import { Sheet, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { buildLayoutRows, isWideType, useSystemFieldsLayout } from 'ui-modules';
import { usePropertySystemFields } from '../hooks/usePropertySystemFields';
import { useSystemFieldsLayoutSave } from '../hooks/useSystemFieldsLayoutSave';
import { LayoutEditor } from './LayoutEditor';

export const SystemFieldsLayoutSheet = ({
  contentType,
  open,
  onClose,
}: {
  contentType: string;
  open: boolean;
  onClose: () => void;
}) => (
  <Sheet open={open} onOpenChange={onClose}>
    <Sheet.View className="p-0">
      {open && (
        <SystemFieldsLayoutEditor contentType={contentType} onClose={onClose} />
      )}
    </Sheet.View>
  </Sheet>
);

const SystemFieldsLayoutEditor = ({
  contentType,
  onClose,
}: {
  contentType: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
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
    />
  );
};
