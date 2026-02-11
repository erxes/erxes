import { Form, Select } from 'erxes-ui';
import { useGetTags } from '@/ebarimt/settings/product-rules-on-tax/hooks/useTags';
import { ITag } from '@/ebarimt/settings/product-rules-on-tax/types/tags';

export const SelectTags = ({
  value,
  onValueChange,
  disabled,
}: {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const { tags, loading } = useGetTags({
    skip: false,
    variables: {
      type: 'core:product',
    },
  });

  const selectedTag = tags?.find((tag: ITag) => tag._id === value);

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || loading}
    >
      <Form.Control>
        <Select.Trigger>
          <span>{selectedTag?.name || 'Select a tag'}</span>
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        {tags?.map((tag: ITag) => (
          <Select.Item key={tag._id} value={tag._id}>
            {tag.name} {tag.code ? `(${tag.code})` : ''}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
