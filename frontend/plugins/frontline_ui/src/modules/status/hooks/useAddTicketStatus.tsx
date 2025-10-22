import { useMutation } from '@apollo/client';
import { ADD_TICKET_STATUS } from '@/status/graphql/mutation/addTicketStatus';
import { useToast } from 'erxes-ui';
import { GET_TICKET_STATUS_BY_TYPE } from '@/status/graphql/query/getTicketStatusByType';

export const useAddTicketStatus = () => {
  const { toast } = useToast();
  const [addStatus] = useMutation(ADD_TICKET_STATUS, {
    onCompleted: () => {
      toast({
        title: 'Success!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
    refetchQueries: [GET_TICKET_STATUS_BY_TYPE],
  });

  return {
    addStatus,
  };
};
