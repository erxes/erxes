import { Button, Form, Spinner } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
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
  const saving = getSaving();

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
                    Publish
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === 'inactive' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => field.onChange('inactive')}
                    className="h-8"
                  >
                    Draft
                  </Button>
                </div>
              </Form.Control>
            </Form.Item>
          )}
        />
      </Form>
      <Button onClick={() => form.handleSubmit(onSubmit)()} disabled={saving}>
        {saving ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Saving...
          </>
        ) : (
          'Save'
        )}
      </Button>
    </div>
  );
};
