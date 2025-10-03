import { Combobox, Form, Input, Popover, Select } from 'erxes-ui';
import {
  SelectBranches,
  SelectDepartments,
  SelectMember,
  SelectTags,
} from 'ui-modules';
import { useRef, useState } from 'react';

import { SelectBoard } from '../SelectBoards';

const VISIBILITY_TYPES = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
];

const GeneralForm = ({ form }: { form: any }) => {
  const { control, watch } = form;

  const [open, setOpen] = useState(false);
  const visibility = watch('visibility');

  const selectParentRef =
    useRef<React.ElementRef<typeof Combobox.Trigger>>(null);

  return (
    <div className="space-y-3">
      <Form.Field
        control={control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{field.name}</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="Enter pipeline name" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="visibility"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Visibility</Form.Label>
            <Form.Control>
              <Select onValueChange={field.onChange} value={field.value}>
                <Select.Trigger
                  className={!field.value ? 'text-muted-foreground' : ''}
                >
                  {field.value || 'Select visibility'}
                </Select.Trigger>
                <Select.Content>
                  {VISIBILITY_TYPES.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
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
        control={control}
        name="boardId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Board</Form.Label>
            <SelectBoard.FormItem
              mode="single"
              onValueChange={field.onChange}
              value={field.value}
              className="focus-visible:relative focus-visible:z-10"
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="tagId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Tag</Form.Label>
            <SelectTags.Provider
              tagType="sales:deal"
              value={field.value}
              onValueChange={(tag) => {
                field.onChange(tag);
                setOpen(false);
              }}
            >
              <Popover open={open} onOpenChange={setOpen}>
                <Form.Control>
                  <Combobox.Trigger ref={selectParentRef}>
                    <SelectTags.Value />
                  </Combobox.Trigger>
                </Form.Control>
                <Combobox.Content>
                  <SelectTags.Command disableCreateOption />
                </Combobox.Content>
              </Popover>
            </SelectTags.Provider>
            <Form.Message />
          </Form.Item>
        )}
      />
      {visibility === 'private' && (
        <>
          <Form.Field
            control={control}
            name="departmentIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Departments</Form.Label>
                <SelectDepartments.FormItem
                  mode="multiple"
                  value={field.value}
                  onValueChange={field.onChange}
                  className="focus-visible:relative focus-visible:z-10"
                />
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name="branchIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Branches</Form.Label>
                <SelectBranches.FormItem
                  onValueChange={field.onChange}
                  value={field.value}
                  mode="multiple"
                  className="focus-visible:relative focus-visible:z-10"
                />
              </Form.Item>
            )}
          />
          <Form.Field
            name="memberIds"
            control={control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Team members</Form.Label>
                <SelectMember.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  mode="multiple"
                />
              </Form.Item>
            )}
          />
        </>
      )}
    </div>
  );
};

export default GeneralForm;
