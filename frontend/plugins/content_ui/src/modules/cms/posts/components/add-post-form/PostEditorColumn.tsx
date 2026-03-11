import { Form, Input } from 'erxes-ui';
import { PostPreview } from '../../PostPreview';
import { formatInitialContent } from '../../formHelpers';
import { CustomFieldsSection } from './CustomFieldsSection';

interface PostEditorColumnProps {
  form: any;
  selectedLanguage: string;
  defaultLanguage: string;
  selectedType: string | undefined;
  fieldGroups: any[];
  fullPost: any;
  generateSlug: (val: string) => string;
  handleEditorChange: (content: string) => void;
  getCustomFieldValue: (fieldId: string) => any;
  updateCustomFieldValue: (fieldId: string, value: any) => void;
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
}: PostEditorColumnProps) => (
  <div className="col-span-2">
    <Form.Field
      control={form.control}
      name="title"
      render={({ field }) => (
        <Form.Item className="mb-4">
          <Form.Label>
            Post Title
            {selectedLanguage !== defaultLanguage && (
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
