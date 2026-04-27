import { Form, Input, MultipleSelector, Button } from 'erxes-ui';
import { IconPlus, IconCheck } from '@tabler/icons-react';
import { useInlineCategory } from './hooks/useInlineCategory';

interface CategoryFieldProps {
  form: any;
  categories: any[];
  websiteId: string;
}

export const CategoryField = ({
  form,
  categories,
  websiteId,
}: CategoryFieldProps) => {
  const sortedCategories = [...(categories || [])].sort((a, b) =>
    (a?.label || '').localeCompare(b?.label || ''),
  );
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
          <Form.Label>Category</Form.Label>

          <Form.Control>
            <div className="flex gap-2">
              <MultipleSelector
                value={sortedCategories.filter((o) =>
                  (field.value || []).includes(o.value),
                )}
                options={sortedCategories}
                placeholder="Select"
                hidePlaceholderWhenSelected={true}
                emptyIndicator="Empty"
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
                placeholder="Category name"
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
