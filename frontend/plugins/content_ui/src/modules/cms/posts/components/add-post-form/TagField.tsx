import { Form, MultipleSelector } from 'erxes-ui';
import { useInlineTag } from './hooks/useInlineTag';

interface TagFieldProps {
  form: any;
  tags: any[];
  websiteId: string;
}

export const TagField = ({ form, tags, websiteId }: TagFieldProps) => {
  const { resolveTagIds } = useInlineTag(websiteId);

  return (
    <Form.Field
      control={form.control}
      name="tagIds"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Tag</Form.Label>
          <Form.Control>
            <MultipleSelector
              value={tags.filter((o) => (field.value || []).includes(o.value))}
              options={tags}
              placeholder="Select"
              hidePlaceholderWhenSelected={true}
              emptyIndicator="Empty"
              creatable
              onChange={async (opts) => {
                const ids = await resolveTagIds(opts, tags);
                field.onChange(ids);
              }}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
