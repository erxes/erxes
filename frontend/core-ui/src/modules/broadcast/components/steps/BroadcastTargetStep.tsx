import { Form, Input } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { BroadcastSelectTargetType } from '../select/BroadcastSelectTargetType';
import { BroadcastSegmentStep } from './BroadcastSegmentStep';
import { BroadcastTagStep } from './BroadcastTagStep';

const BROADCAST_TARGET_STEPS = {
  segment: {
    title: 'Segment',
    description: 'Segment who’s going to receive this broacast',
    content: BroadcastSegmentStep,
  },
  tag: {
    title: 'Tag',
    description: 'Configure, Write and Compose your broadcast',
    content: BroadcastTagStep,
  },
};

export const BroadcastTargetStep = () => {
  const { control, watch } = useFormContext();

  const targetType: 'tag' | 'segment' = watch('targetType');

  const TargetStepContent = BROADCAST_TARGET_STEPS[targetType].content;

  return (
    <form className="flex flex-col h-full gap-3">
      <Form.Field
        name="title"
        control={control}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Title</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="Title" />
            </Form.Control>
          </Form.Item>
        )}
      />

      <Form.Field
        name="targetType"
        control={control}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Target Type</Form.Label>
            <Form.Control>
              <BroadcastSelectTargetType
                value={field.value}
                onValueChange={field.onChange}
              />
            </Form.Control>
          </Form.Item>
        )}
      />

      <div className="flex-1">
        <TargetStepContent />
      </div>
    </form>
  );
};
