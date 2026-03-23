import { Form, Input, Select, Textarea } from 'erxes-ui';
import { SelectParentPage } from './SelectParentPage';

interface PageContentTabProps {
  form: any;
  websiteId: string;
  currentPageId?: string;
  availableLanguages: string[];
  defaultLanguage: string;
  selectedLanguage: string;
  languageOptions: any[];
  handleLanguageChange: (lang: string) => void;
}

export const PageContentTab = ({
  form,
  websiteId,
  currentPageId,
  availableLanguages,
  defaultLanguage,
  selectedLanguage,
  languageOptions,
  handleLanguageChange,
}: PageContentTabProps) => (
  <>
    {availableLanguages.length > 0 && (
      <Form.Item>
        <Form.Label>Language</Form.Label>
        <Form.Control>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {languageOptions.map((option: any) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                  {option.isDefault && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Default)
                    </span>
                  )}
                  {option.hasTranslation && (
                    <span className="ml-2 text-green-600">&#10003;</span>
                  )}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </Form.Control>
      </Form.Item>
    )}

    <Form.Field
      control={form.control}
      name="slug"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Slug</Form.Label>
          <Form.Control>
            <Input {...field} placeholder="/about-us" />
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
            Description
            {selectedLanguage !== defaultLanguage && (
              <span className="ml-2 text-xs text-blue-600">
                ({selectedLanguage})
              </span>
            )}
          </Form.Label>
          <Form.Control>
            <Textarea
              {...field}
              placeholder="Page description"
              rows={4}
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

    <Form.Field
      control={form.control}
      name="parentId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Parent Page</Form.Label>
          <SelectParentPage.FormItem
            value={field.value}
            onValueChange={field.onChange}
            websiteId={websiteId}
            currentPageId={currentPageId}
          />
          <Form.Message />
        </Form.Item>
      )}
    />
  </>
);
