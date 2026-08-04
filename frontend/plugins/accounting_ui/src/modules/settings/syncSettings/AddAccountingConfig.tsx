import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ACCOUNTING_SETTINGS_CODES } from '../constants/settingsRoutes';
import { useAccountingConfigAdd } from '../hooks/useAccountingConfigAdd';
import { SettingsRuleByCode } from './AddEditConfigRules';

export const AddAccountingConfig = ({
  code,
}: {
  code: ACCOUNTING_SETTINGS_CODES;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Тохиргоо нэмэх
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-4xl">
        <Sheet.Header>
          <Sheet.Title>Тохиргоо нэмэх</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <AddAccountingConfigForm code={code} setOpen={setOpen} />
      </Sheet.View>
    </Sheet>
  );
};

export const AddAccountingConfigForm = ({
  code,
  setOpen,
}: {
  code: ACCOUNTING_SETTINGS_CODES;
  setOpen: (open: boolean) => void;
}) => {
  const rule = SettingsRuleByCode[code];
  const form = useForm<any>({ defaultValues: {} });

  const { addConfig, loading } = useAccountingConfigAdd({
    onCompleted: () => {
      setOpen(false);
      form.reset();
    },
  });

  if (!rule) {
    return <div>Тохиргооны төрөл тодорхойгүй байна</div>;
  }

  const { subIdFieldName, FormComponent } = SettingsRuleByCode[code] || {};

  const onSubmit = (data: any) => {
    addConfig({
      code,
      subId: data[subIdFieldName] ?? '',
      value: data,
    });
  };

  return <FormComponent form={form} onSubmit={onSubmit} loading={loading} />;
};
