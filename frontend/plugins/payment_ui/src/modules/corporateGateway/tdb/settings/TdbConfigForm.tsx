import { useState } from 'react';
import {
  Button,
  Input,
  Label,
  ScrollArea,
  Sheet,
  Switch,
  toast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ITdbConfig } from '../configs/types';

type Props = {
  config?: ITdbConfig;
  addConfig: (variables: Record<string, any>) => Promise<any>;
  editConfig: (variables: Record<string, any>) => Promise<any>;
  onCancel: () => void;
};

const DEFAULT_API_URL = 'https://api-sandbox.tdbmlabs.mn:8443';

export const TdbConfigForm = ({
  config,
  addConfig,
  editConfig,
  onCancel,
}: Props) => {
  const { t } = useTranslation('payment');
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({
    name: config?.name ?? '',
    description: config?.description ?? '',
    apiUrl: config?.apiUrl ?? DEFAULT_API_URL,
    clientId: config?.clientId ?? '',
    clientSecret: config?.clientSecret ?? '',
    testMode: config?.testMode ?? true,
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
            <div className="space-y-1">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                name="name"
                autoComplete="off"
                value={values.name}
                onChange={onChange}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">{t('description')}</Label>
              <Input
                id="description"
                name="description"
                autoComplete="off"
                value={values.description}
                onChange={onChange}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="apiUrl">{t('api-url')}</Label>
              <Input
                id="apiUrl"
                name="apiUrl"
                autoComplete="off"
                value={values.apiUrl}
                onChange={onChange}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="clientId">{t('client-id')}</Label>
              <Input
                id="clientId"
                name="clientId"
                autoComplete="off"
                value={values.clientId}
                onChange={onChange}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="clientSecret">{t('client-secret')}</Label>
              <Input
                id="clientSecret"
                name="clientSecret"
                type="password"
                autoComplete="new-password"
                value={values.clientSecret}
                onChange={onChange}
              />

            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="testMode">{t('environment')}</Label>
              <Switch
                id="testMode"
                checked={values.testMode}
                onCheckedChange={(checked) =>
                  setValues((prev) => ({ ...prev, testMode: checked }))
                }
              />
            </div>
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

export default TdbConfigForm;
