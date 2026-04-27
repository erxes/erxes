import { Form, Select, PopoverScoped, Combobox } from 'erxes-ui';
import { Control, useWatch } from 'react-hook-form';
import { SelectMember } from 'ui-modules';

interface PipelineVisibilityProps {
  control: Control<any>;
}

export const PipelineVisibility = ({ control }: PipelineVisibilityProps) => {
  const visibility = useWatch({ control, name: 'visibility' });
  return (
    <div className="space-y-4">
      <Form.Field
        control={control}
        name="visibility"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Pipeline Visibility</Form.Label>
            <Form.Control>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger className="w-full">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="public">Public</Select.Item>
                  <Select.Item value="private">Private</Select.Item>
                </Select.Content>
              </Select>
            </Form.Control>
          </Form.Item>
        )}
      />

      {visibility === 'private' && (
        <Form.Field
          control={control}
          name="memberIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Team Members</Form.Label>
              <Form.Control>
                <SelectMember.Provider
                  value={field.value || []}
                  onValueChange={(val) => field.onChange(val as string[])}
                  mode="multiple"
                >
                  <PopoverScoped>
                    <Combobox.Trigger className="w-full h-10 rounded-lg border bg-background">
                      <SelectMember.Value placeholder="Select team members" />
                    </Combobox.Trigger>
                    <Combobox.Content>
                      <SelectMember.Content />
                    </Combobox.Content>
                  </PopoverScoped>
                </SelectMember.Provider>
              </Form.Control>
            </Form.Item>
          )}
        />
      )}
    </div>
  );
};
