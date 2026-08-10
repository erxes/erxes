import { Form, Input, Select } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MenuContentItem, MenuCustomType, MenuFormData } from '../types/menuDrawerTypes';

interface MenuLinkFieldProps {
  form: UseFormReturn<MenuFormData>;
  linkType: string;
  isTranslationMode: boolean;
  isCustomType: boolean;
  isPostType: boolean;
  customTypes: MenuCustomType[];
  pages: MenuContentItem[];
  posts: MenuContentItem[];
  categories: MenuContentItem[];
  tags: MenuContentItem[];
}

function getPickerLabel(
  linkType: string,
  isCustomType: boolean,
  customTypes: MenuCustomType[],
): string {
  if (linkType === 'page') return 'Page';
  if (linkType === 'post') return 'Post';
  if (linkType === 'category') return 'Category';
  if (linkType === 'tag') return 'Tag';
  if (isCustomType) return customTypes.find((ct) => ct._id === linkType)?.label || 'Post';
  return '';
}

export function MenuLinkField({
  form,
  linkType,
  isTranslationMode,
  isCustomType,
  isPostType,
  customTypes,
  pages,
  posts,
  categories,
  tags,
}: MenuLinkFieldProps) {
  const { t } = useTranslation('content');
  return (
    <>
      <Form.Field
        control={form.control}
        name="linkType"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('link-type')}</Form.Label>
            <Form.Control>
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue('url', '');
                }}
              >
                <Select.Trigger>
                  <Select.Value placeholder={t('select-type')} />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="url">{t('url')}</Select.Item>
                  <Select.Item value="page">{t('page')}</Select.Item>
                  <Select.Item value="post">{t('post')}</Select.Item>
                  <Select.Item value="category">{t('category')}</Select.Item>
                  <Select.Item value="tag">{t('tag')}</Select.Item>
                  {customTypes.length > 0 && <Select.Separator />}
                  {customTypes.map((ct) => (
                    <Select.Item key={ct._id} value={ct._id}>
                      {ct.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Control>
          </Form.Item>
        )}
      />

      {linkType === 'url' ? (
        <Form.Field
          control={form.control}
          name="url"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('url')}
                {isTranslationMode && (
                  <span className="ml-2 text-xs text-gray-500">({t('shared-across-languages')})</span>
                )}
              </Form.Label>
              <Form.Control>
                <Input {...field} placeholder="/path-or-https://..." required />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      ) : (
        <Form.Field
          control={form.control}
          name="url"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {getPickerLabel(linkType, isCustomType, customTypes)}
              </Form.Label>
              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value
                      placeholder={`Select ${getPickerLabel(linkType, isCustomType, customTypes).toLowerCase()}...`}
                    />
                  </Select.Trigger>
                  <Select.Content>
                    {linkType === 'page' &&
                      pages.map((p) => (
                        <Select.Item key={p._id} value={`/${p.slug}`}>
                          {p.name}
                        </Select.Item>
                      ))}
                    {isPostType &&
                      posts.map((p) => (
                        <Select.Item key={p._id} value={`/${p.slug}`}>
                          {p.title}
                        </Select.Item>
                      ))}
                    {linkType === 'category' &&
                      categories.map((c) => (
                        <Select.Item key={c._id} value={`/category/${c.slug}`}>
                          {c.name}
                        </Select.Item>
                      ))}
                    {linkType === 'tag' &&
                      tags.map((t) => (
                        <Select.Item key={t._id} value={`/tag/${t.slug}`}>
                          {t.name}
                        </Select.Item>
                      ))}
                  </Select.Content>
                </Select>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      )}
    </>
  );
}
