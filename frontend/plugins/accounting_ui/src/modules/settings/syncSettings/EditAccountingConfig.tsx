import { Sheet, useQueryState } from 'erxes-ui';
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
    <Sheet
      open={open !== null && open !== ''}
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpen(null);
      }}
    >
      <Sheet.View className="sm:max-w-4xl">
        <Sheet.Header>
          <Sheet.Title>Синк тохиргоо засах</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <EditAccountingConfigForm code={code} />
      </Sheet.View>
    </Sheet>
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
    return <div>Тохиргооны төрөл тодорхойгүй байна</div>;
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
