import { Badge, Form, Input } from 'erxes-ui';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PostPreview } from '../../PostPreview';
import { CustomFieldValue } from '../../CustomFieldInput';
import { CustomFieldsSection, FieldGroup } from './CustomFieldsSection';

interface PostEditorColumnProps {
  form: UseFormReturn<FieldValues>;
  selectedLanguage: string;
  defaultLanguage: string;
  selectedType: string | undefined;
  fieldGroups: FieldGroup[];
  websiteId?: string;
  fullPost: { _id?: string } | null | undefined;
  handleEditorChange: (content: string) => void;
  getCustomFieldValue: (fieldId: string) => CustomFieldValue;
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
          <Form.Item className="mb-3">
            <Form.Label className="sr-only">{t('post-title')}</Form.Label>
            <div className="flex items-center gap-2">
              <Form.Control>
                <Input
                  {...field}
                  placeholder={t('post-title-placeholder')}
                  className="h-auto bg-transparent px-0 py-1 text-2xl font-semibold shadow-none focus-visible:shadow-none placeholder:text-muted-foreground/60"
                />
              </Form.Control>
              {selectedLanguage !== defaultLanguage && (
                <Badge variant="secondary" className="shrink-0 uppercase">
                  {selectedLanguage}
                </Badge>
              )}
            </div>
            <Form.Message />
          </Form.Item>
        )}
      />
      <PostPreview
        form={form}
        selectedLanguage={selectedLanguage}
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
