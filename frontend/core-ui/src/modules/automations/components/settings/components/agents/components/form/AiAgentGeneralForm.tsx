import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Form, Input, Textarea } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export const AiAgentGeneralForm = () => {
  const { control } = useFormContext<TAiAgentForm>();

  return (
    <div className="grid gap-4">
      <Form.Field
        control={control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Name</Form.Label>
            <Form.Control>
              <Input
                type="text"
                placeholder="Facebook Order Router"
                {...field}
              />
            </Form.Control>
            <Form.Description>
              Give the agent a clear name so it is easy to pick inside
              automation actions.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Description</Form.Label>
            <Form.Control>
              <Textarea
                rows={5}
                placeholder="Routes Facebook conversations, classifies intents, and extracts order attributes for downstream automation steps."
                {...field}
              />
            </Form.Control>
            <Form.Description>
              Describe what this agent is meant to do for the team and for
              future automation builders.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
