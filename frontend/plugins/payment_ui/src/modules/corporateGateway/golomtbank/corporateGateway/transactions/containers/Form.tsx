import { gql, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui/hooks/use-toast';

import TransactionForm from '../components/Form';
import { mutations, queries } from '../../../graphql';

import { IGolomtBankTransactionInput } from '../../../types/ITransactions';

type Props = {
  configId: string;
  accountNumber?: string;
  accountList?: any;
  accountName: string;
  closeModal: () => void;
};

const TransactionFormContainer = ({
  configId,
  accountNumber,
  accountList,
  accountName,
  closeModal,
}: Props) => {
  const [transferMutation, { loading }] = useMutation(
    gql(mutations.addMutation),
    {
      refetchQueries: [
        {
          query: gql(queries.listQuery),
          variables: {
            accountId: accountNumber,
            configId,
          },
        },
      ],
    },
  );

  const onSubmit = async (transfer: IGolomtBankTransactionInput) => {
    try {
      await transferMutation({
        variables: {
          transfer,
          configId,
        },
      });

      toast({
        variant: 'success',
        title: 'Transfer completed',
        description: 'The transaction was processed successfully.',
      });

      closeModal();
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Transfer failed',
        description: e.message,
      });
    }
  };

  return (
    <TransactionForm
      configId={configId}
      accountNumber={accountNumber}
      accounts={accountList}
      accountName={accountName}
      onSubmit={onSubmit}
      loading={loading}
      closeModal={closeModal}
    />
  );
};

export default TransactionFormContainer;
