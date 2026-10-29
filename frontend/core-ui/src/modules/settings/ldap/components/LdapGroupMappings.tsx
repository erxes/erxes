import { Control, useFieldArray } from 'react-hook-form';
import { Button, Form, Input, MultipleSelector } from 'erxes-ui';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { TLdapConfigForm } from '@/settings/ldap/schema';
import { usePermissionGroupOptions } from '@/settings/ldap/hooks/usePermissionGroupOptions';

export const LdapGroupMappings = ({
  control,
}: {
  control: Control<TLdapConfigForm>;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'ldap' });
  const { options } = usePermissionGroupOptions();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'groupMappings',
  });

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Form.Label>{t('group-mappings')}</Form.Label>
        <Form.Description>{t('group-mappings-description')}</Form.Description>
      </div>
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('no-group-mappings')}</p>
      )}
      {fields.map((item, index) => (
        <div key={item.id} className="flex items-start gap-2">
          <Form.Field
            control={control}
            name={`groupMappings.${index}.groupDn`}
            render={({ field }) => (
              <Form.Item className="flex-1">
                <Form.Control>
                  <Input {...field} placeholder="CN=Sales,OU=Groups,DC=example,DC=local" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name={`groupMappings.${index}.permissionGroupIds`}
            render={({ field }) => (
              <Form.Item className="flex-1">
                <Form.Control>
                  <MultipleSelector
                    options={options}
                    value={options.filter((option) =>
                      field.value.includes(option.value),
                    )}
                    onChange={(selected) =>
                      field.onChange(selected.map((option) => option.value))
                    }
                    placeholder={t('select-permission-groups')}
                    hidePlaceholderWhenSelected
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('remove-mapping')}
            onClick={() => remove(index)}
          >
            <IconTrash className="text-destructive" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        className="self-start"
        onClick={() => append({ groupDn: '', permissionGroupIds: [] })}
      >
        <IconPlus /> {t('add-mapping')}
      </Button>
    </div>
  );
};
