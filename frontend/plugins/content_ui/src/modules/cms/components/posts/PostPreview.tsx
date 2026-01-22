import { useState } from 'react';
import { Tabs, Button, Form, Editor } from 'erxes-ui';

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
  content,
  form,
  selectedLanguage,
  defaultLanguage,
  fullPost,
  formatInitialContent,
  handleEditorChange,
}: PostPreviewProps) => {
  return (
    <div className="rounded-lg border overflow-hidden bg-white">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="text-sm font-semibold">
          Content Editor
          {selectedLanguage !== defaultLanguage && (
            <span className="ml-2 text-xs text-blue-600">
              ({selectedLanguage})
            </span>
          )}
        </h3>
      </div>
      <div className="p-4">
        <Form {...form}>
          <Form.Field
            control={form.control}
            name="content"
            render={() => (
              <Form.Item>
                <Form.Control>
                  <Editor
                    className="h-[calc(100vh-200px)]"
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
    </div>
  );
};
