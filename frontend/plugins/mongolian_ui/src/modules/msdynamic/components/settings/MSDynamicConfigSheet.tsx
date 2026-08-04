import { UseFormReturn } from 'react-hook-form';
import { Button, Sheet, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { TMSDynamicConfig } from '../../types';
import { MSDynamicConfigFormFields } from './MSDynamicConfigFormFields';

type MSDynamicConfigSheetProps = {
  form: UseFormReturn<TMSDynamicConfig>;
  formId: string;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TMSDynamicConfig) => void;
  open: boolean;
  title: string;
  trigger?: React.ReactNode;
};

export const MSDynamicConfigSheet = ({
  form,
  formId,
  loading,
  onOpenChange,
  onSubmit,
  open,
  title,
  trigger,
}: MSDynamicConfigSheetProps) => {
  const { t } = useTranslation('mongolian');
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <Sheet.Trigger asChild>{trigger}</Sheet.Trigger>}
      <Sheet.View side="right" className="bg-background sm:max-w-3xl">
        <Sheet.Header>
          <Sheet.Title>{title}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <MSDynamicConfigFormFields
            form={form}
            onSubmit={onSubmit}
            formId={formId}
            loading={loading}
          />
        </div>
        <Sheet.Footer className="gap-2 border-t bg-background">
          <Sheet.Close asChild>
            <Button variant="outline" size="lg" disabled={loading}>
              {t('cancel')}
            </Button>
          </Sheet.Close>
          <Button type="submit" form={formId} size="lg" disabled={loading}>
            {loading ? <Spinner /> : t('save')}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
