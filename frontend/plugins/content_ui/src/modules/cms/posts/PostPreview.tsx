import { Form, Editor } from 'erxes-ui';
import { REACT_APP_API_URL } from 'erxes-ui/utils';
import { readImage } from 'erxes-ui/utils/core';

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
                  uploadFile={async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    const response = await fetch(
                      `${REACT_APP_API_URL}/upload-file?kind=main`,
                      {
                        method: 'post',
                        body: formData,
                        credentials: 'include',
                      },
                    );
                    const key = await response.text();
                    return readImage(key);
                  }}
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
