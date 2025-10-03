import { REMOVE_DOCUMENT } from "@/documents/graphql/documentMutations";
import { useMutation } from "@apollo/client";
import { toast } from "erxes-ui";

export const useDocumentRemove = () => {
  const [removeDocument, { loading }] = useMutation(REMOVE_DOCUMENT, {
    onCompleted: () => {
      toast({ title: 'Document removed successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error?.message,
        variant: 'destructive',
      });
    },
  });

  return {
    removeDocument,
    loading,
  };
};
