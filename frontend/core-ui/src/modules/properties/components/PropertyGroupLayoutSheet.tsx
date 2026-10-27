import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { Spinner } from 'erxes-ui';
import { useGroupPanelSelection } from '../hooks/useGroupPanelSelection';
import { useTranslation } from 'react-i18next';
import { buildGroupRows, LayoutEditor, useFields } from 'ui-modules';
import { useGroupLayoutSave } from '../hooks/useGroupLayoutSave';
import { activeLayoutGroupState } from '../states/activeLayoutGroupState';
import { IFieldGroup } from '../types/Properties';

export const PropertyGroupLayoutSheet = () => {
  const { group, close, loading, error } = useGroupPanelSelection(
    activeLayoutGroupState,
    'layoutGroupCode',
  );

  return (
    <CoreModulePanel
      name={'properties/PropertyGroupLayoutSheet'}
      open={!!group}
      onOpenChange={(open) => !open && close()}
    >
      <CoreModulePanel.View
        className="p-0"
        loading={loading}
        error={!!error}
        notFound={!loading && !group}
      >
        {group && (
          <GroupLayoutEditor key={group._id} group={group} onClose={close} />
        )}
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};

const GroupLayoutEditor = ({
  group,
  onClose,
}: {
  group: IFieldGroup;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { fields, loading } = useFields({
    groupId: group._id,
    contentType: group.contentType,
  });
  const { save, loading: saving } = useGroupLayoutSave(group, onClose);

  if (loading) {
    return <Spinner containerClassName="py-12" />;
  }

  return (
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
    />
  );
};
