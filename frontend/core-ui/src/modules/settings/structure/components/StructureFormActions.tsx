import { IconPlus } from '@tabler/icons-react';
import { Button, Spinner, Kbd } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';

export const StructureFormActions = ({
  onCancel,
  onSave,
  saving,
  permission,
  cancelVariant = 'ghost',
}: {
  onCancel: () => void;
  onSave?: () => void;
  saving: boolean;
  permission:
    | 'branchesManage'
    | 'departmentsManage'
    | 'unitsManage'
    | 'positionsManage';
  cancelVariant?: 'ghost' | 'secondary';
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  return (
    <div className="flex shrink-0 items-center justify-end gap-1 border-t bg-background p-2">
      <Button type="button" variant={cancelVariant} onClick={onCancel}>
        {t('cancel')}
      </Button>
      <Can action={permission}>
        <Button
          disabled={saving}
          type={onSave ? 'button' : 'submit'}
          onClick={onSave}
        >
          {saving ? <Spinner /> : t('save')}
        </Button>
      </Can>
    </div>
  );
};

export const StructureCreateButton = ({
  permission,
  onClick,
  label,
}: {
  permission:
    | 'branchesManage'
    | 'departmentsManage'
    | 'unitsManage'
    | 'positionsManage';
  onClick: () => void;
  label: string;
}) => (
  <Can action={permission}>
    <Button onClick={onClick}>
      <IconPlus /> {label}
      <Kbd>C</Kbd>
    </Button>
  </Can>
);
