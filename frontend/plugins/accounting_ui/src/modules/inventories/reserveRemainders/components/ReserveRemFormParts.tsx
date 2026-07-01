import { Button, Form, Input, Sheet, Spinner } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type TRemainderField = { remainder: number };

export const RemainderFormField = ({
  control,
}: {
  control: Control<TRemainderField>;
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
    <Sheet.Footer className="p-5 border-t bg-background shrink-0">
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
