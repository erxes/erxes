import { Control } from 'react-hook-form';
import { Form, Input, Editor } from 'erxes-ui';
import { ElementCreateFormType } from '../constants/formSchema';

export const ElementNameField = ({
  control,
}: {
  control: Control<ElementCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="name"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Name <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Input placeholder="Element name" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ElementNoteField = ({
  control,
}: {
  control: Control<ElementCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="note"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Note</Form.Label>
          <Form.Description>
            Not visible for clients and agents.
          </Form.Description>
          <Form.Control>
            <Editor
              initialContent={field.value}
              onChange={field.onChange}
              isHTML
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ElementStartTimeField = ({
  control,
}: {
  control: Control<ElementCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="startTime"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Start Time</Form.Label>
          <Form.Control>
            <Input type="time" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ElementDurationField = ({
  control,
}: {
  control: Control<ElementCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="duration"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Duration (minutes)</Form.Label>
          <Form.Control>
            <Input type="number" placeholder="0" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ElementCostField = ({
  control,
}: {
  control: Control<ElementCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="cost"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Cost</Form.Label>
          <Form.Control>
            <Input type="number" step="0.01" placeholder="0.00" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
