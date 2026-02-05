import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollArea, Sheet } from 'erxes-ui';
import {
  voucherFormSchema,
  VoucherFormValues,
} from '../../constants/voucherFormSchema';
import { VoucherAddRestrictionCoreField } from './voucher-restriction-field/VoucherAddRestrictionCoreField';
import { VoucherAddRestrictionMoreFields } from './voucher-restriction-field/VoucherAddRestrictionMoreFields';

export function AddVoucherRestrictionForm({
  onOpenChange,
}: Readonly<{
  onOpenChange: (open: boolean) => void;
}>) {
  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherFormSchema),
    defaultValues: {
      minimumSpend: 0,
      maximumSpend: 0,
      categoryIds: [],
      excludeCategoryIds: [],
      productIds: [],
      excludeProductIds: [],
      tag: '',
      orExcludeTag: '',
      kind: 'voucher',
    },
  });

  return (
    <Sheet.Content className="flex-auto overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-5 flex flex-col gap-4">
          <VoucherAddRestrictionCoreField form={form} />
          <VoucherAddRestrictionMoreFields form={form} />
        </div>
      </ScrollArea>
    </Sheet.Content>
  );
}
