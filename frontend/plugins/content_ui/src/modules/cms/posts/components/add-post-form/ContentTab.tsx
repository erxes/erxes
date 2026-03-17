import { Form, Select, Textarea, Switch } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { CategoryField } from './CategoryField';
import { TagField } from './TagField';
import { LanguageSelector } from '~/modules/cms/shared/LanguageSelector';

interface SelectOption {
  label: string;
  value: string;
}

interface CustomType {
  _id: string;
  label: string;
  code: string;
}

interface LanguageOption {
  value: string;
  label: string;
  isDefault: boolean;
  hasTranslation: boolean;
}

interface ContentTabProps {
  form: UseFormReturn;
  categories: SelectOption[];
  tags: SelectOption[];
  customTypes: CustomType[];
  websiteId: string;
  availableLanguages: string[];
  defaultLanguage: string;
  selectedLanguage: string;
  languageOptions: LanguageOption[];
  handleLanguageChange: (lang: string) => void;
}

export const ContentTab = ({
  form,
  categories,
  tags,
  customTypes,
  websiteId,
  availableLanguages,
  defaultLanguage,
  selectedLanguage,
  languageOptions,
  handleLanguageChange,
}: ContentTabProps) => {
  const isTranslationMode =
    Boolean(selectedLanguage) && selectedLanguage !== defaultLanguage;

  return (
    <>
      {availableLanguages.length > 0 && (
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          languageOptions={languageOptions}
          onLanguageChange={handleLanguageChange}
        />
      )}

      <Form.Field
        control={form.control}
        name="type"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>
              Post Type
              {isTranslationMode && (
                <span className="ml-2 text-xs text-gray-500">
                  (shared across languages)
                </span>
              )}
            </Form.Label>
            <Form.Control>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value placeholder="Choose type" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="post">post</Select.Item>
                  {customTypes.map((type) => (
                    <Select.Item key={type._id} value={type._id}>
                      {type.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>
              Short Description
              {isTranslationMode && (
                <span className="ml-2 text-xs text-blue-600">
                  ({selectedLanguage})
                </span>
              )}
            </Form.Label>
            <Form.Control>
              <Textarea
                {...field}
                placeholder="Description here"
                rows={8}
                maxLength={500}
              />
            </Form.Control>
            <div className="text-xs text-muted-foreground text-right">
              {field.value?.length || 0}/500 characters
            </div>
            <Form.Message />
          </Form.Item>
        )}
      />

      <CategoryField
        form={form}
        categories={categories}
        websiteId={websiteId}
      />
      <TagField form={form} tags={tags} websiteId={websiteId} />

      <Form.Field
        control={form.control}
        name="featured"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Featured</Form.Label>
            <Form.Description>
              Turn this post into a featured post
            </Form.Description>
            <Form.Control>
              <Switch
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};
