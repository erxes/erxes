import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { InputOTP } from 'erxes-ui/components/input-otp';

const meta: Meta<typeof InputOTP> = {
  title: 'Components/InputOTP',
  component: InputOTP,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof InputOTP>;

const SixDigits = () => {
  const [value, setValue] = useState('');

  return (
    <InputOTP maxLength={6} value={value} onChange={setValue}>
      <InputOTP.Group>
        <InputOTP.Slot index={0} />
        <InputOTP.Slot index={1} />
        <InputOTP.Slot index={2} />
      </InputOTP.Group>
      <InputOTP.Separator />
      <InputOTP.Group>
        <InputOTP.Slot index={3} />
        <InputOTP.Slot index={4} />
        <InputOTP.Slot index={5} />
      </InputOTP.Group>
    </InputOTP>
  );
};

export const Default: Story = {
  render: () => <SixDigits />,
};
