// Adapted from AI Elements `confirmation` (vercel/ai-elements): a plain div
// root instead of shadcn Alert, erxes-ui Button.
import type { DynamicToolUIPart, ToolUIPart } from 'ai';
import { Button, cn } from 'erxes-ui';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';

type ToolPart = ToolUIPart | DynamicToolUIPart;
type ToolUIPartApproval = ToolPart['approval'];

interface IConfirmationContext {
  approval: ToolUIPartApproval;
  state: ToolPart['state'];
}

const ConfirmationContext = createContext<IConfirmationContext | null>(null);

const useConfirmation = () => {
  const context = useContext(ConfirmationContext);

  if (!context) {
    throw new Error('Confirmation components must be used within Confirmation');
  }

  return context;
};

export type ConfirmationProps = ComponentProps<'div'> & {
  approval?: ToolUIPartApproval;
  state: ToolPart['state'];
};

export const Confirmation = ({
  className,
  approval,
  state,
  ...props
}: ConfirmationProps) => {
  const contextValue = useMemo(() => ({ approval, state }), [approval, state]);

  if (!approval || state === 'input-streaming' || state === 'input-available') {
    return null;
  }

  return (
    <ConfirmationContext.Provider value={contextValue}>
      <div className={cn('flex flex-col gap-2', className)} {...props} />
    </ConfirmationContext.Provider>
  );
};

const settled = (state: ToolPart['state']) =>
  state === 'approval-responded' ||
  state === 'output-denied' ||
  state === 'output-available';

export const ConfirmationRequest = ({ children }: { children?: ReactNode }) =>
  useConfirmation().state === 'approval-requested' ? children : null;

export const ConfirmationAccepted = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const { approval, state } = useConfirmation();
  return approval?.approved && settled(state) ? children : null;
};

export const ConfirmationRejected = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const { approval, state } = useConfirmation();
  return approval?.approved === false && settled(state) ? children : null;
};

export const ConfirmationActions = ({
  className,
  ...props
}: ComponentProps<'div'>) =>
  useConfirmation().state === 'approval-requested' ? (
    <div className={cn('flex items-center gap-2', className)} {...props} />
  ) : null;

export const ConfirmationAction = (props: ComponentProps<typeof Button>) => (
  <Button size="sm" type="button" {...props} />
);
