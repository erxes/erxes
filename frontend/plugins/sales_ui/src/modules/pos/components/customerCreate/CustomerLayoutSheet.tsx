import { Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LayoutEditor } from 'ui-modules';
import { ICustomerFormFieldOption } from '@/pos/hooks/useCustomerFormFields';

export const CustomerLayoutSheet = ({
  open,
  layout,
  options,
  onApply,
  onClose,
}: {
  open: boolean;
  layout: string[][];
  options: ICustomerFormFieldOption[];
  onApply: (layout: string[][] | null) => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation('sales');
  const placed = new Set(layout.flat());

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <Sheet.View className="p-0">
        {open && (
          <LayoutEditor
            title={t('customer-form-layout', 'Customer form layout')}
            items={options
              .filter((option) => placed.has(option.code))
              .map(({ code, name }) => ({ id: code, name }))}
            initialRows={layout}
            saving={false}
            onSave={(rows) => {
              onApply(rows);
              onClose();
            }}
            onClose={onClose}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};
