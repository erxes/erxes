import { Form, Editor } from 'erxes-ui';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { uploadMediaFile, useMediaPicker } from '../media/MediaPicker';

interface PostPreviewProps {
  form: UseFormReturn<FieldValues>;
  selectedLanguage: string;
  defaultLanguage: string;
  fullPost: { _id?: string } | null | undefined;
  handleEditorChange: (value: string) => void;
}

export const PostPreview = ({
  form,
  selectedLanguage,
  defaultLanguage,
  fullPost,
  handleEditorChange,
}: PostPreviewProps) => {
  const { selectMedia, picker } = useMediaPicker();

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
                <div>
                  <Editor
                    className="h-[calc(100vh-200px)] border text-justify"
                    key={`editor-${selectedLanguage}-${fullPost?._id || 'new'}`}
                    isHTML
                    initialContent={form.getValues('content') || ''}
                    onChange={handleEditorChange}
                    uploadFile={async (file) =>
                      (await uploadMediaFile(file)).url
                    }
                    selectMedia={selectMedia}
                  />
                  {picker}
                </div>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </Form>
    </div>
  );
};
