import { IconX } from '@tabler/icons-react';
import { Button, Form, Select } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TFilesPrincipalType, TFilesRole } from 'ui-modules';
import { FILES_PRINCIPAL_TYPES } from '../constants/filesAccess';
import { TFilesAccessForm } from '../utils/filesAccessForm';
import { FilesPrincipalSelect } from './FilesPrincipalSelect';

type TFilesGrantRowProps = {
  control: Control<TFilesAccessForm>;
  index: number;
  type: TFilesPrincipalType;
  roles: TFilesRole[];
  onTypeChange: (value: string) => void;
  onRemove: () => void;
};

export const FilesGrantRow = ({
  control,
  index,
  type,
  roles,
  onTypeChange,
  onRemove,
}: TFilesGrantRowProps) => {
  const { t } = useTranslation('files');

  return (
    <div className="flex items-start gap-2">
      <Form.Field
        control={control}
        name={`access.${index}.type`}
        render={({ field }) => (
          <Form.Item className="w-36 shrink-0">
            <Select value={field.value} onValueChange={onTypeChange}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {FILES_PRINCIPAL_TYPES.map((option) => (
                  <Select.Item key={option} value={option}>
                    {t(`principal-${option}`)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name={`access.${index}.id`}
        render={({ field, fieldState }) => (
          <Form.Item className="min-w-0 flex-1">
            <FilesPrincipalSelect
              type={type}
              value={field.value}
              onChange={field.onChange}
            />
            {fieldState.error && (
              <p className="text-xs text-destructive">
                {t('choose-principal')}
              </p>
            )}
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name={`access.${index}.role`}
        render={({ field }) => (
          <Form.Item className="w-36 shrink-0">
            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {roles.map((role) => (
                  <Select.Item key={role} value={role}>
                    {t(`role-${role}`)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Item>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t('remove-grant')}
        onClick={onRemove}
      >
        <IconX />
      </Button>
    </div>
  );
};
