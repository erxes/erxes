import { useImperativeHandle } from 'react';

interface UseAutomationRemoteFormSubmitProps {
  formRef: React.RefObject<{ submit: () => void }>;
  callback: () => void;
}

export const useAutomationRemoteFormSubmit = ({
  formRef,
  callback,
}: UseAutomationRemoteFormSubmitProps) => {
  useImperativeHandle(formRef, () => ({
    submit: () => callback(),
  }));
};
