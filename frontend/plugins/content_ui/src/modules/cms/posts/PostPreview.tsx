import { Form, Editor } from 'erxes-ui';

interface PostPreviewProps {
  content: string;
  form: any;
  selectedLanguage: string;
  defaultLanguage: string;
  fullPost: any;
  formatInitialContent: (content: string) => any;
  handleEditorChange: (value: string, editorInstance?: any) => void;
}

export const PostPreview = ({
  content: _content,
  form,
  selectedLanguage,
  defaultLanguage,
  fullPost,
  formatInitialContent,
  handleEditorChange,
}: PostPreviewProps) => {
  return (
    <div className="rounded-lg overflow-hidden bg-background">
      <Form {...form}>
        <Form.Field
          control={form.control}
          name="content"
          render={() => (
            <Form.Item>
              <Form.Label>
                Content
                {selectedLanguage !== defaultLanguage && (
                  <span className="ml-2 text-xs text-blue-600">
                    ({selectedLanguage})
                  </span>
                )}
              </Form.Label>
              <Form.Control>
                <Editor
                  className="h-[calc(100vh-200px)] border text-justify"
                  key={`editor-${selectedLanguage}-${fullPost?._id || 'new'}`}
                  initialContent={formatInitialContent(
                    form.getValues('content') || '',
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
  );
};
