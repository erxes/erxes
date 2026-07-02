import { Button, Form, Input, ScrollArea, Sheet, Spinner } from 'erxes-ui';
import { ReactNode } from 'react';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const ReserveRemSheet = ({
  open,
  onOpenChange,
  title,
  trigger,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  trigger?: ReactNode;
  children: ReactNode;
}) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    {trigger}
    <Sheet.View className="p-0 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none">
      <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
        <Sheet.Title>{title}</Sheet.Title>
        <Sheet.Close />
        <Sheet.Description className="sr-only">{title}</Sheet.Description>
      </Sheet.Header>
      <Sheet.Content className="overflow-hidden flex-auto">
        <ScrollArea className="h-full">{children}</ScrollArea>
      </Sheet.Content>
    </Sheet.View>
  </Sheet>
);

export const RemainderFormField = ({
  control,
}: {
  control: Control<any>;
}) => {
  const { t } = useTranslation('accounting');
  return (
    <Form.Field
      control={control}
      name="remainder"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('reserve-remainder')}</Form.Label>
          <Form.Control>
            <Input
              type="number"
              value={field.value ?? ''}
              onChange={(e) =>
                field.onChange(
                  e.target.value === '' ? undefined : Number(e.target.value),
                )
              }
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const ReserveRemFormFooter = ({ loading }: { loading: boolean }) => {
  const { t } = useTranslation('accounting');
  return (
    <Sheet.Footer className="p-5 border-t bg-muted/30">
      <Sheet.Close asChild>
        <Button variant="outline" type="button" size="lg">
          {t('cancel')}
        </Button>
      </Sheet.Close>
      <Button type="submit" size="lg" disabled={loading}>
        {loading && <Spinner />}
        {t('save')}
      </Button>
    </Sheet.Footer>
  );
};
