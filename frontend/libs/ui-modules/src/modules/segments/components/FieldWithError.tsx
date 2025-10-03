import { Form, HoverCard } from 'erxes-ui';
import { FieldError } from 'react-hook-form';
type Props = {
  error?: FieldError;
  children: React.ReactNode;
};

export const FieldWithError = ({ error, children }: Props) => {
  if (error) {
    return (
      <HoverCard>
        <HoverCard.Trigger asChild className="ring-2 ring-red-300 rounded">
          <div>{children}</div>
        </HoverCard.Trigger>
        <HoverCard.Content className="w-80">
          <Form.Message />
        </HoverCard.Content>
      </HoverCard>
    );
  }

  return children;
};
