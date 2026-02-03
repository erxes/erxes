import { Dialog, useQueryState } from 'erxes-ui';
import { AccountingDialog } from '@/layout/components/Dialog';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';
import { ACCOUNTING_SETTINGS_CODES } from '../constants/settingsRoutes';
import { SyncDealConfigForm } from './SyncDealConfigForm';
import { SyncOrderConfigForm } from './SyncOrderConfigFrom';
import { useAccountingConfigEdit } from '../hooks/useAccountingConfigEdit';
import { useAtomValue } from 'jotai';
import { accountingConfigDetailAtom } from '../states/accountingConfigState';

type SettingsRule = {
  subIdFieldName: string;
  FormComponent: React.ComponentType<{
    form: UseFormReturn<any>;
    onSubmit: (data: any) => void;
    loading: boolean;
  }>;
};

const settingsRuleByCode: Record<ACCOUNTING_SETTINGS_CODES, SettingsRule> = {
  syncDeal: {
    subIdFieldName: 'stageId',
    FormComponent: SyncDealConfigForm,
  },
  syncOrder: {
    subIdFieldName: 'posId',
    FormComponent: SyncOrderConfigForm,
  },
};

export const EditAccountingConfig = ({ code }: { code: ACCOUNTING_SETTINGS_CODES }) => {
  const [open, setOpen] = useQueryState<string>('configId');

  return (
    <Dialog open={open !== null && open !== ''} onOpenChange={() => setOpen(null)}>
      <AccountingDialog title="Edit Sync Config" description="Edit an config" className='max-w-4xl'>
        <EditAccountingConfigForm code={code} />
      </AccountingDialog>
    </Dialog>
  );
};

export const EditAccountingConfigForm = ({
  code,
}: {
  code: ACCOUNTING_SETTINGS_CODES,
}) => {
  const rule = settingsRuleByCode[code];
  const [configId, setConfigId] = useQueryState('configId', { defaultValue: '' });
  const configValueDetail = useAtomValue(accountingConfigDetailAtom);

  const { editConfig, loading: editLoading } = useAccountingConfigEdit({
    onCompleted: () => {
      setConfigId('')
      form.reset();
    },
  });

  if (!rule) {
    return <div>Unknown config type </div>;
  }

  const { subIdFieldName, FormComponent } = settingsRuleByCode[code] || {};

  const form = useForm<any>({
    defaultValues: { ...configValueDetail },
  });

  const { reset } = form;

  useEffect(() => {
    if (configValueDetail) {
      reset(configValueDetail);
    }
  }, [configValueDetail, reset]);

  const handleSubmit = (data: any) => {
    console.log(data)
    const initialData = { ...configValueDetail };
    const newData = { ...initialData, ...data };

    editConfig({
      id: configId ?? "",
      subId: data[subIdFieldName],
      value: newData,
    });
  };

  return (
    <>
      <FormComponent
        form={form}
        onSubmit={handleSubmit}
        loading={editLoading}
      />
    </>
  );
};
