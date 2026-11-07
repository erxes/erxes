import { IFieldGroup } from '@/properties/types/Properties';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  usePagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { Spinner } from 'erxes-ui';
import { useGroupPanelSelection } from '@/properties/hooks/useGroupPanelSelection';
import { useTranslation } from 'react-i18next';
import {
  buildGroupRows,
  LayoutEditor,
  useFields,
  RecordSidePanel,
} from 'ui-modules';
import { useGroupLayoutSave } from '@/properties/hooks/useGroupLayoutSave';
import { activeLayoutGroupState } from '@/properties/states/activeLayoutGroupState';
export const PropertyGroupLayoutSheet = () => {
  const { group, open, close, loading, error } = useGroupPanelSelection(
    activeLayoutGroupState,
    'layoutGroupCode',
  );
  const pagePanel = usePagePanel({
    identity: group?._id || 'new',
    name: 'properties/PropertyGroupLayoutSheet',
    open: open,
    onOpenChange: (open) => !open && close(),
  });
  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded &&
      pagePanel.allowed &&
      !loading &&
      !error &&
      !(!loading && !group) ? (
        <>
          {group && (
            <GroupLayoutEditor key={group._id} group={group} onClose={close} />
          )}
        </>
      ) : (
        <PagePanelStatus entry={pagePanel} loading={loading} error={!!error} />
      )}
    </div>,
    pagePanel,
  );
};
const GroupLayoutEditor = ({
  group,
  onClose,
}: {
  group: IFieldGroup;
  onClose: () => void;
}) => {
  const pagePanel = usePagePanelContext();
  const { t } = useTranslation('settings', {
    keyPrefix: 'properties',
  });
  const { fields, loading } = useFields({
    groupId: group._id,
    contentType: group.contentType,
  });
  const { save, loading: saving } = useGroupLayoutSave(
    group,
    pagePanel.onClose,
  );
  if (loading) {
    return <Spinner containerClassName="py-12" />;
  }
  return (
    <>
      <RecordSidePanel.Header
        title={`${t('layout', 'Layout')} — ${group.name}`}
        {...pagePanel.headerProps}
      />
      <LayoutEditor
        title={`${t('layout', 'Layout')} — ${group.name}`}
        items={fields.map((field) => ({
          id: field._id,
          name: field.name,
          dimmed: field.isVisible === false,
        }))}
        // Starts from what records show now, so every field is already placed.
        initialRows={buildGroupRows(group, fields).map((row) =>
          row.fields.map((field) => field._id),
        )}
        saving={saving}
        onSave={save}
        onClose={onClose}
        layout="record"
      />
    </>
  );
};
