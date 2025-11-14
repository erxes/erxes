import { Form, Input, Textarea } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export const AiAgentGeneralForm = () => {
  const { control } = useFormContext();

  return (
    <>
      <Form.Field
        control={control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Name</Form.Label>
            <Form.Control>
              <Input
                type="text"
                placeholder="Enter your ai agent name"
                {...field}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>description</Form.Label>
            <Form.Control>
              <Textarea
                placeholder="Enter your ai agent description"
                {...field}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="prompt"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>prompt</Form.Label>
            <Form.Control>
              <Textarea placeholder="Enter your ai agent prompt" {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="instructions"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>instructions</Form.Label>
            <Form.Control>
              <Textarea
                placeholder="Enter your ai agent instructions"
                {...field}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};
