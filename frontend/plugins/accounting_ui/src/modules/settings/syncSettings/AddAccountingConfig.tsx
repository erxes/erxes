import { IconPlus } from '@tabler/icons-react';
import { Button, Dialog } from 'erxes-ui';
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
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Тохиргоо нэмэх
        </Button>
      </Dialog.Trigger>
      <Dialog.ContentCombined
        title="Тохиргоо нэмэх"
        description="Шинэ тохиргоо нэмэх"
        className="sm:max-w-2xl"
      >
        <AddAccountingConfigForm code={code} setOpen={setOpen} />
      </Dialog.ContentCombined>
    </Dialog>
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
