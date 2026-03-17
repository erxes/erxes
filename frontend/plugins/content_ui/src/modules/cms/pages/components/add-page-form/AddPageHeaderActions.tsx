import { Button, Form, Spinner } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { PageFormData } from './hooks/usePageForm';

interface AddPageHeaderActionsProps {
  form: UseFormReturn<PageFormData>;
  onSubmit: () => void;
  creating: boolean;
  saving: boolean;
}

export const AddPageHeaderActions = ({
  form,
  onSubmit,
  creating,
  saving,
}: AddPageHeaderActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Form {...form}>
        <div className="flex items-center gap-2">
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
        </div>
      </Form>
      <Button
        onClick={() => form.handleSubmit(onSubmit)()}
        disabled={creating || saving}
      >
        {creating || saving ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Saving...
          </>
        ) : (
          <div>Save</div>
        )}
      </Button>
    </div>
  );
};
