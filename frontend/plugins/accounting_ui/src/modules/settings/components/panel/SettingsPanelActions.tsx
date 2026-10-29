import { useTranslation } from 'react-i18next';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Spinner, useConfirm } from 'erxes-ui';
import { Can, useSidePanel } from 'ui-modules';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

export const SettingsPanelAddButton = ({
  contentType,
  label,
}: {
  contentType: string;
  label: string;
}) => {
  const { openDraft } = useSettingsPanel(contentType);

  return (
    <Button onClick={openDraft}>
      <IconPlus />
      {label}
    </Button>
  );
};

export const SettingsPanelRemoveAction = ({
  message,
  loading,
  permission,
  onRemove,
}: {
  message: string;
  loading: boolean;
  permission?: string;
  onRemove: (onCompleted: () => void) => void;
}) => {
  const { t } = useTranslation('accounting');
  const { confirm } = useConfirm();
  const { close } = useSidePanel();

  const handleDelete = () =>
    confirm({
      message,
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => onRemove(close));

  const button = (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      title={t('delete')}
      disabled={loading}
      onClick={handleDelete}
    >
      {loading ? <Spinner size="sm" /> : <IconTrash className="size-4" />}
    </Button>
  );

  return permission ? <Can action={permission}>{button}</Can> : button;
};
