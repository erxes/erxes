import { Form, Input, Editor } from 'erxes-ui';
import { formatInitialContent } from '~/modules/cms/posts/formHelpers';

interface PageEditorColumnProps {
  form: any;
  selectedLanguage: string;
  defaultLanguage: string;
  page?: any;
  handleEditorChange: (content: string) => void;
}

export const PageEditorColumn = ({
  form,
  selectedLanguage,
  defaultLanguage,
  page,
  handleEditorChange,
}: PageEditorColumnProps) => {
  const isTranslationMode =
    Boolean(selectedLanguage) && selectedLanguage !== defaultLanguage;

  return (
    <div className="col-span-2">
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item className="mb-4">
            <Form.Label>
              Page Name
              {isTranslationMode && (
                <span className="ml-2 text-xs text-blue-600">
                  ({selectedLanguage})
                </span>
              )}
            </Form.Label>
            <Form.Control>
              <Input {...field} placeholder="Enter page name" required />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <div className="rounded-lg overflow-hidden bg-background">
        <Form {...form}>
          <Form.Field
            control={form.control}
            name="description"
            render={() => (
              <Form.Item>
                <Form.Label>
                  Content
                  {isTranslationMode && (
                    <span className="ml-2 text-xs text-blue-600">
                      ({selectedLanguage})
                    </span>
                  )}
                </Form.Label>
                <Form.Control>
                  <Editor
                    className="h-[calc(100vh-200px)] border text-justify"
                    key={`page-editor-${selectedLanguage}-${page?._id || 'new'}`}
                    initialContent={formatInitialContent(
                      form.getValues('description') || '',
                    )}
                    onChange={handleEditorChange}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </Form>
      </div>
    </div>
  );
};
