import { Dialog, useQueryState } from 'erxes-ui';
import { AccountingDialog } from '@/layout/components/Dialog';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { ACCOUNTING_SETTINGS_CODES } from '../constants/settingsRoutes';
import { useAccountingConfigEdit } from '../hooks/useAccountingConfigEdit';
import { useAtomValue } from 'jotai';
import { accountingConfigDetailAtom } from '../states/accountingConfigState';
import { SettingsRuleByCode } from './AddEditConfigRules';

export const EditAccountingConfig = ({
  code,
}: {
  code: ACCOUNTING_SETTINGS_CODES;
}) => {
  const [open, setOpen] = useQueryState<string>('configId');

  return (
    <Dialog
      open={open !== null && open !== ''}
      onOpenChange={() => setOpen(null)}
    >
      <AccountingDialog
        title="Edit Sync Config"
        description="Edit an config"
        className="max-w-4xl"
      >
        <EditAccountingConfigForm code={code} />
      </AccountingDialog>
    </Dialog>
  );
};

export const EditAccountingConfigForm = ({
  code,
}: {
  code: ACCOUNTING_SETTINGS_CODES;
}) => {
  const rule = SettingsRuleByCode[code];
  const [configId, setConfigId] = useQueryState('configId', {
    defaultValue: '',
  });
  const configValueDetail = useAtomValue(accountingConfigDetailAtom);

  const { editConfig, loading: editLoading } = useAccountingConfigEdit({
    onCompleted: () => {
      setConfigId('');
      form.reset();
    },
  });

  const form = useForm<any>({
    defaultValues: { ...configValueDetail },
  });

  const { reset } = form;

  useEffect(() => {
    if (configValueDetail) {
      reset(configValueDetail);
    }
  }, [configValueDetail, reset]);

  if (!rule) {
    return <div>Unknown config type </div>;
  }

  const { subIdFieldName, FormComponent } = SettingsRuleByCode[code] || {};

  const handleSubmit = (data: any) => {
    const initialData = { ...configValueDetail };
    const newData = { ...initialData, ...data };

    editConfig({
      id: configId ?? '',
      subId: data[subIdFieldName],
      value: newData,
    });
  };

  return (
    <FormComponent form={form} onSubmit={handleSubmit} loading={editLoading} />
  );
};
