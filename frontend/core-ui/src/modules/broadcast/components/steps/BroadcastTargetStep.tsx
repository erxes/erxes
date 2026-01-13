import { IconUser } from '@tabler/icons-react';
import { Form, Input } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { BroadcastSelectTargetType } from '../select/BroadcastSelectTargetType';
import { BroadcastBrandStep } from './BroadcastBrandStep';
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
  brand: {
    title: 'Brand',
    description: 'Select brands for this broadcast',
    content: BroadcastBrandStep,
  },
};

export const BroadcastTargetStep = () => {
  const { control, watch } = useFormContext();

  const targetType: 'tag' | 'segment' = watch('targetType');
  const targetCount = watch('targetCount');

  const { content: TargetStepContent } = BROADCAST_TARGET_STEPS[targetType];

  return (
    <form className="flex flex-col h-full gap-3">
      <Form.Field
        name="title"
        control={control}
        rules={{ required: 'Title is required' }}
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
        rules={{ required: 'Target type is required' }}
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

      <Form.Field
        name="targetIds"
        control={control}
        rules={{ required: 'Customer are required' }}
        render={({ field }) => (
          <Form.Item className="h-full">
            <Form.Label className="flex items-center justify-between px-2">
              <div
                className={`flex items-center gap-1`}
              >
                <IconUser size={16} />
                <span>Customer</span>
              </div>
              <span className="text-xs">
                {targetCount || 0}
              </span>
            </Form.Label>
            <Form.Control>
              <TargetStepContent {...field} />
            </Form.Control>
          </Form.Item>
        )}
      />
    </form>
  );
};
