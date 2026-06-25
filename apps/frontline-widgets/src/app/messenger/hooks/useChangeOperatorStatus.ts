import { useMutation } from '@apollo/client';
import { useSetAtom } from 'jotai';
import { WIDGET_CHANGE_OPERATOR_STATUS_MUTATION } from '../graphql/mutations';
import { operatorStatusAtom } from '../states';

export function useChangeOperatorStatus() {
  const setOperatorStatus = useSetAtom(operatorStatusAtom);
  const [changeOperatorStatus, { loading }] = useMutation(
    WIDGET_CHANGE_OPERATOR_STATUS_MUTATION,
  );

  const toggle = (conversationId: string, operatorStatus: 'bot' | 'operator') => {
    return changeOperatorStatus({
      variables: { conversationId, operatorStatus },
      refetchQueries: ['widgetsConversationDetail'],
      onCompleted: () => {
        setOperatorStatus(operatorStatus);
      },
    });
  };

  return { toggle, loading };
}
