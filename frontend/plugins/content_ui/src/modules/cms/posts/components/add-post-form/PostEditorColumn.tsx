import { Form, Input } from 'erxes-ui';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
  PostCustomFieldValue,
  PostFormData,
  PostFormPost,
} from '@/cms/posts/types';
import { PostPreview } from '../../PostPreview';
import { CustomFieldsSection, FieldGroup } from './CustomFieldsSection';

interface PostEditorColumnProps {
  form: UseFormReturn<PostFormData>;
  selectedLanguage: string;
  defaultLanguage: string;
  selectedType: string | undefined;
  fieldGroups: FieldGroup[];
  websiteId?: string;
  fullPost: PostFormPost | null | undefined;
  handleEditorChange: (content: string) => void;
  getCustomFieldValue: (fieldId: string) => PostCustomFieldValue;
  updateCustomFieldValue: (
    fieldId: string,
    value: string | boolean | string[],
  ) => void;
}

export const PostEditorColumn = ({
  form,
  selectedLanguage,
  defaultLanguage,
  selectedType,
  fieldGroups,
  websiteId,
  fullPost,
  handleEditorChange,
  getCustomFieldValue,
  updateCustomFieldValue,
}: PostEditorColumnProps) => {
  const { t } = useTranslation('content');
  return (
  <div className="col-span-2">
    <Form.Field
      control={form.control}
      name="title"
      render={({ field }) => (
        <Form.Item className="mb-4">
          <Form.Label>
            {t('post-title')}
            {selectedLanguage !== defaultLanguage && (
              <span className="ml-2 text-xs text-blue-600">
                ({selectedLanguage})
              </span>
            )}
          </Form.Label>
          <Form.Control>
            <Input {...field} placeholder={t('post-title-placeholder')} />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
    <PostPreview
      form={form}
      selectedLanguage={selectedLanguage}
      defaultLanguage={defaultLanguage}
      fullPost={fullPost}
      handleEditorChange={handleEditorChange}
    />
    {selectedType && fieldGroups.length > 0 && (
      <CustomFieldsSection
        fieldGroups={fieldGroups}
        websiteId={websiteId}
        getCustomFieldValue={getCustomFieldValue}
        updateCustomFieldValue={updateCustomFieldValue}
      />
    )}
  </div>
  );
};
