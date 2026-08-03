import { useState } from 'react';
import { Button, Input, Label, ScrollArea, Sheet, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IGolomtBankConfigsItem } from '../types/IConfigs';

type Props = {
  config?: IGolomtBankConfigsItem;
  addConfig: (variables: Record<string, any>) => Promise<any>;
  editConfig: (variables: Record<string, any>) => Promise<any>;
  onCancel: () => void;
};

const FIELDS: {
  name: keyof Omit<IGolomtBankConfigsItem, '_id'>;
  label: string;
  type?: string;
}[] = [
  { name: 'name', label: 'name' },
  { name: 'organizationName', label: 'organization' },
  { name: 'clientId', label: 'client-id' },
  { name: 'accountId', label: 'account-id' },
  { name: 'registerId', label: 'register-id' },
  { name: 'golomtCode', label: 'golomt-code' },
  { name: 'ivKey', label: 'iv-key' },
  { name: 'sessionKey', label: 'session-key' },
  { name: 'apiUrl', label: 'api-url' },
  { name: 'configPassword', label: 'config-password', type: 'password' },
];

export const GolomtConfigForm = ({
  config,
  addConfig,
  editConfig,
  onCancel,
}: Props) => {
  const { t } = useTranslation('payment');
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({
    name: config?.name ?? '',
    organizationName: config?.organizationName ?? '',
    clientId: config?.clientId ?? '',
    accountId: config?.accountId ?? '',
    registerId: config?.registerId ?? '',
    golomtCode: config?.golomtCode ?? '',
    ivKey: config?.ivKey ?? '',
    sessionKey: config?.sessionKey ?? '',
    apiUrl: config?.apiUrl ?? '',
    configPassword: config?.configPassword ?? '',
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (config) {
        await editConfig({ ...values, _id: config._id });
        toast({ title: t('success'), description: t('config-updated') });
      } else {
        await addConfig(values);
        toast({ title: t('success'), description: t('config-added') });
      }

      onCancel();
    } catch (error: any) {
      toast({ title: t('error'), description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full overflow-hidden"
    >
      <Sheet.Header className="gap-3 border-b">
        <Sheet.Title>{config ? t('edit-config') : t('add-config')}</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>

      <Sheet.Content className="flex-auto overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-3 p-5">
            {FIELDS.map(({ name, label, type }) => (
              <div className="space-y-1" key={name}>
                <Label htmlFor={name}>{t(label)}</Label>
                <Input
                  id={name}
                  name={name}
                  type={type ?? 'text'}
                  autoComplete="off"
                  value={values[name]}
                  onChange={onChange}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </Sheet.Content>

      <Sheet.Footer className="flex justify-end gap-1 bg-muted p-2.5 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? t('saving')
            : config
              ? t('edit-config')
              : t('add-config')}
        </Button>
      </Sheet.Footer>
    </form>
  );
};

export default GolomtConfigForm;
