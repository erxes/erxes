import { Button, Sheet, Spinner } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface EBarimtConfigFormSheetProps {
  children: ReactNode;
  formId: string;
  loading?: boolean;
  title: string;
}

export const EBarimtConfigFormSheet = ({
  children,
  formId,
  loading = false,
  title,
}: EBarimtConfigFormSheetProps) => {
  const { t } = useTranslation('mongolian');

  return (
    <Sheet.View side="right" className="bg-background sm:max-w-4xl">
      <Sheet.Header>
        <Sheet.Title>{title}</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      <Sheet.Footer className="gap-2 border-t bg-background">
        <Sheet.Close asChild>
          <Button variant="outline" size="lg">
            {t('cancel')}
          </Button>
        </Sheet.Close>
        <Button type="submit" form={formId} size="lg" disabled={loading}>
          {loading ? <Spinner /> : t('save')}
        </Button>
      </Sheet.Footer>
    </Sheet.View>
  );
};
