import { Sheet, Spinner } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { buildGroupRows, LayoutEditor, useFields } from 'ui-modules';
import { useGroupLayoutSave } from '../hooks/useGroupLayoutSave';
import { activeLayoutGroupState } from '../states/activeLayoutGroupState';
import { IFieldGroup } from '../types/Properties';

export const PropertyGroupLayoutSheet = () => {
  const [group, setGroup] = useAtom(activeLayoutGroupState);

  return (
    <Sheet open={!!group} onOpenChange={() => setGroup(null)}>
      <Sheet.View className="p-0">
        {group && (
          <GroupLayoutEditor group={group} onClose={() => setGroup(null)} />
        )}
      </Sheet.View>
    </Sheet>
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
