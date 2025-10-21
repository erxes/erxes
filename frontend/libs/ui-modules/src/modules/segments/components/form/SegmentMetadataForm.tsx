import { Form, Input, Textarea } from 'erxes-ui';

import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { SelectSegment } from '../SelectSegment';

interface SegmentMetadataFormProps {
  isTemporary?: boolean;
}
export const SegmentMetadataForm = ({
  isTemporary,
}: SegmentMetadataFormProps) => {
  const { segment, form } = useSegment();

  if (isTemporary) {
    return null;
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-row gap-4">
        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <Form.Item className="flex-1">
              <Form.Label>Name</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="subOf"
          render={({ field }) => (
            <Form.Item className="flex-1">
              <Form.Label>Parent Segment</Form.Label>
              <Form.Control>
                <SelectSegment
                  exclude={segment?._id ? [segment._id] : undefined}
                  selected={field.value}
                  onSelect={(value) => {
                    field.onChange(field.value === value ? null : value);
                  }}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="color"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Color</Form.Label>
              <Form.Control>
                <Input {...field} type="color" className="p-0" />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Description</Form.Label>
            <Form.Control>
              <Textarea {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
