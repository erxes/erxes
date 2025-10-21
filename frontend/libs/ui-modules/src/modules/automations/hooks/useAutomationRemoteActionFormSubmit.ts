import { useImperativeHandle } from 'react';

interface UseAutomationRemoteActionFormSubmitProps {
  formRef: React.RefObject<{ submit: () => void }>;
  callback: () => void;
}

export const useAutomationRemoteActionFormSubmit = ({
  formRef,
  callback,
}: UseAutomationRemoteActionFormSubmitProps) => {
  useImperativeHandle(formRef, () => ({
    submit: () => callback(),
  }));
};
