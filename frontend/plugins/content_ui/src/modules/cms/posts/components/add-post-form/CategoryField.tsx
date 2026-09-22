import { Form, Input, MultipleSelector, Button } from 'erxes-ui';
import { IconPlus, IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useInlineCategory } from './hooks/useInlineCategory';

interface CategoryFieldProps {
  form: any;
  categories: any[];
  websiteId: string;
}

const normalizeOptionText = (text: string) => text.toLowerCase().trim();

const getSearchableCommandProps = (options: any[]) => ({
  filter: (value: string, search: string) => {
    const option = options.find((item) => item.value === value);
    const text = normalizeOptionText(`${option?.label || ''} ${value}`);

    return text.includes(normalizeOptionText(search)) ? 1 : -1;
  },
});

export const CategoryField = ({
  form,
  categories,
  websiteId,
}: CategoryFieldProps) => {
  const { t } = useTranslation('content');
  const options = categories || [];
  const {
    newCategoryName,
    setNewCategoryName,
    showCategoryInput,
    toggleInput,
    addingCategory,
    createCategory,
  } = useInlineCategory(websiteId);

  return (
    <Form.Field
      control={form.control}
      name="categoryIds"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('category')}</Form.Label>

          <Form.Control>
            <div className="flex gap-2">
              <MultipleSelector
                value={options.filter((o) =>
                  (field.value || []).includes(o.value),
                )}
                options={options}
                placeholder={t('select')}
                hidePlaceholderWhenSelected={true}
                emptyIndicator={t('empty')}
                commandProps={getSearchableCommandProps(options)}
                onChange={(opts) => field.onChange(opts.map((o) => o.value))}
              />
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={toggleInput}
              >
                <IconPlus
                  size={14}
                  className={`transition-transform duration-200 ${
                    showCategoryInput ? 'rotate-45' : ''
                  }`}
                />
              </Button>
            </div>
          </Form.Control>
          {showCategoryInput && (
            <div className="flex gap-2 mb-1">
              <Input
                autoFocus
                placeholder={t('category-name')}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const id = await createCategory();
                    if (id) field.onChange([...(field.value || []), id]);
                  } else if (e.key === 'Escape') {
                    toggleInput();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={!newCategoryName.trim() || addingCategory}
                onClick={async () => {
                  const id = await createCategory();
                  if (id) field.onChange([...(field.value || []), id]);
                }}
              >
                <IconCheck size={14} />
              </Button>
            </div>
          )}
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
