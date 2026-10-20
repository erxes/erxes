import { Button, Form, Spinner, toast } from 'erxes-ui';
import { FieldErrors, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IPageFormData } from '../types/pageTypes';

interface PageHeaderActionsProps {
  form: UseFormReturn<IPageFormData>;
  onSubmit: (data: IPageFormData) => void;
  getSaving: () => boolean;
}

export const PageHeaderActions = ({
  form,
  onSubmit,
  getSaving,
}: PageHeaderActionsProps) => {
  const { t } = useTranslation('content');
  const saving = getSaving();

  // Without this, a failed validation on a field that has no visible message
  // (status, thumbnail, custom fields) makes Save look like it does nothing.
  const onInvalid = (errors: FieldErrors<IPageFormData>) => {
    const firstError = Object.values(errors).find((error) => error?.message);
    toast({
      title: t('validation-error'),
      description:
        firstError?.message ||
        t('page-fix-invalid-fields', {
          defaultValue:
            'Some fields are invalid. Review the page and try again.',
        }),
      variant: 'destructive',
      duration: 5000,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Form {...form}>
        <Form.Field
          control={form.control}
          name="status"
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <div className="inline-flex items-center rounded-md border bg-background p-1 gap-1">
                  <Button
                    type="button"
                    variant={field.value === 'active' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => field.onChange('active')}
                    className="h-8"
                  >
                    {t('publish')}
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === 'inactive' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => field.onChange('inactive')}
                    className="h-8"
                  >
                    {t('draft')}
                  </Button>
                </div>
              </Form.Control>
            </Form.Item>
          )}
        />
      </Form>
      <Button
        onClick={() => form.handleSubmit(onSubmit, onInvalid)()}
        disabled={saving}
      >
        {saving ? (
          <>
            <Spinner size="sm" className="mr-2" />
            {t('saving')}
          </>
        ) : (
          t('save')
        )}
      </Button>
    </div>
  );
};
