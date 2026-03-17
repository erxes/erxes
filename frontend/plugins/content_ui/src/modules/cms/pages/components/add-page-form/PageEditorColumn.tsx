import { Form, Input } from 'erxes-ui';
import { PostPreview } from '~/modules/cms/posts/PostPreview';
import { formatInitialContent } from '~/modules/cms/posts/formHelpers';

interface PageEditorColumnProps {
  form: any;
  selectedLanguage: string;
  defaultLanguage: string;
  fullPage: any;
  generateSlug: (val: string) => string;
  handleEditorChange: (content: string) => void;
}

export const PageEditorColumn = ({
  form,
  selectedLanguage,
  defaultLanguage,
  fullPage,
  generateSlug,
  handleEditorChange,
}: PageEditorColumnProps) => (
  <div className="col-span-2">
    <Form.Field
      control={form.control}
      name="name"
      render={({ field }) => (
        <Form.Item className="mb-4">
          <Form.Label>
            Page Title
            {selectedLanguage !== defaultLanguage && (
              <span className="ml-2 text-xs text-blue-600">
                ({selectedLanguage})
              </span>
            )}
          </Form.Label>
          <Form.Control>
            <Input
              {...field}
              placeholder="Page title"
              onChange={(e) => {
                field.onChange(e);
                if (
                  selectedLanguage === defaultLanguage &&
                  !form.getValues('slug')
                ) {
                  form.setValue('slug', generateSlug(e.target.value));
                }
              }}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
    <PostPreview
      content={form.watch('content') || ''}
      form={form}
      selectedLanguage={selectedLanguage}
      defaultLanguage={defaultLanguage}
      fullPost={fullPage}
      formatInitialContent={formatInitialContent}
      handleEditorChange={handleEditorChange}
    />
  </div>
);
