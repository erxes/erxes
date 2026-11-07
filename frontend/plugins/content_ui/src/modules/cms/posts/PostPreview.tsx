import { Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { REACT_APP_API_URL } from 'erxes-ui/utils';
import { readImage } from 'erxes-ui/utils/core';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { CmsPostEditor } from './components/CmsPostEditor';
import { PostWritingStats } from './components/PostWritingStats';

interface PostPreviewProps {
  form: UseFormReturn<FieldValues>;
  selectedLanguage: string;
  fullPost: { _id?: string } | null | undefined;
  handleEditorChange: (value: string) => void;
}

export const PostPreview = ({
  form,
  selectedLanguage,
  fullPost,
  handleEditorChange,
}: PostPreviewProps) => {
  const { t } = useTranslation('content');
  return (
    <div className="rounded-lg overflow-hidden bg-background">
      <Form {...form}>
        <Form.Field
          control={form.control}
          name="content"
          render={() => (
            <Form.Item>
              <Form.Label className="sr-only">{t('content')}</Form.Label>
              <Form.Control>
                <CmsPostEditor
                  className="h-[calc(100vh-220px)] rounded-lg border text-justify"
                  key={`editor-${selectedLanguage}-${fullPost?._id || 'new'}`}
                  initialContent={form.getValues('content') || ''}
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
        <PostWritingStats form={form} />
      </Form>
    </div>
  );
};
