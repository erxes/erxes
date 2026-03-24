import { Form, Input } from 'erxes-ui';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { PostPreview } from '../../PostPreview';
import { CustomFieldValue } from '../../CustomFieldInput';
import { CustomFieldsSection, FieldGroup } from './CustomFieldsSection';

interface PostEditorColumnProps {
  form: UseFormReturn<FieldValues>;
  selectedLanguage: string;
  defaultLanguage: string;
  selectedType: string | undefined;
  fieldGroups: FieldGroup[];
  fullPost: { _id?: string } | null | undefined;
  generateSlug: (val: string) => string;
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
  fullPost,
  generateSlug,
  handleEditorChange,
  getCustomFieldValue,
  updateCustomFieldValue,
}: PostEditorColumnProps) => {
  const isTranslationMode =
    Boolean(selectedLanguage) && selectedLanguage !== defaultLanguage;

  return (
    <div className="col-span-2">
      <Form.Field
        control={form.control}
        name="title"
        render={({ field }) => (
          <Form.Item className="mb-4">
            <Form.Label>
              Post Title
              {isTranslationMode && (
                <span className="ml-2 text-xs text-blue-600">
                  ({selectedLanguage})
                </span>
              )}
            </Form.Label>
            <Form.Control>
              <Input
                {...field}
                placeholder="Post title"
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
        fullPost={fullPost}
        formatInitialContent={formatInitialContent}
        handleEditorChange={handleEditorChange}
      />
      {selectedType && fieldGroups.length > 0 && (
        <CustomFieldsSection
          fieldGroups={fieldGroups}
          getCustomFieldValue={getCustomFieldValue}
          updateCustomFieldValue={updateCustomFieldValue}
        />
      )}
    </div>
  );
};
