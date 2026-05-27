import { Sheet, Button, Spinner, toast } from 'erxes-ui';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import {
  addEBarimtPosInConfigSchema,
  TPosInEbarimtConfig,
} from '@/ebarimt/settings/pos-in-ebarimt-config/types';
import { useSavePosInEbarimtConfig } from '@/ebarimt/settings/pos-in-ebarimt-config/hooks/useSavePosInEbarimtConfig';
import { PosInEBarimtConfigFormFields } from './PosInEBarimtConfigFormFields';

const FORM_ID = 'add-pos-in-ebarimt-form';

export const AddPosInEBarimtConfig = () => {
  const [open, setOpen] = useState(false);
  const { savePosInEbarimtConfig, loading } = useSavePosInEbarimtConfig();

  const form = useForm<TPosInEbarimtConfig>({
    resolver: zodResolver(addEBarimtPosInConfigSchema),
    defaultValues: {
      title: '',
      posId: '',
      posNo: '10003424',
      companyName: '',
      companyRD: '',
      merchantTin: '',
      branchOfProvince: '',
      subProvince: '',
      districtCode: '',
      defaultUnitedCode: '',
      branchNo: '',
      hasVat: false,
      vatPercent: '',
      reverseVatRules: '',
      hasCitytax: false,
      citytaxPercent: '',
      reverseCtaxRules: '',
      headerText: '',
      footerText: '',
      withDescription: false,
      skipEbarimt: false,
      ebarimtUrl: '',
    },
  });

  const handleSubmit = async (data: TPosInEbarimtConfig) => {
    try {
      await savePosInEbarimtConfig(data, 'create');
      setOpen(false);
      form.reset();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create configuration',
        variant: 'destructive',
      });
    }
  };

  const handleBranchChange = useCallback(
    (value: string) => {
      form.setValue('branchOfProvince', value);
      form.setValue('subProvince', '');
      form.setValue('districtCode', '');
    },
    [form],
  );

  const handleSubBranchChange = useCallback(
    (value: string) => {
      form.setValue('subProvince', value);
    },
    [form],
  );

  const memoizedSetValue = useCallback(
    (name: string, value: any) => {
      form.setValue(name as any, value);
    },
    [form],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add Config
        </Button>
      </Sheet.Trigger>
      <Sheet.View side="right" className="bg-background sm:max-w-4xl">
        <Sheet.Header>
          <Sheet.Title>Add Pos In Ebarimt Config</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <PosInEBarimtConfigFormFields
            form={form}
            onSubmit={handleSubmit}
            formId={FORM_ID}
            onBranchChange={handleBranchChange}
            onSubBranchChange={handleSubBranchChange}
            onSetValue={memoizedSetValue}
          />
        </div>
        <Sheet.Footer className="gap-2 border-t bg-background">
          <Sheet.Close asChild>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Sheet.Close>
          <Button type="submit" form={FORM_ID} size="lg" disabled={loading}>
            {loading ? <Spinner /> : 'Save'}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
