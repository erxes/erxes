import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useDeleteAssignment } from '../../../hooks/useDeleteAssignment';

export const DeleteAssignment = ({
  assignmentIds,
}: {
  assignmentIds: string[];
}) => {
  const { confirm } = useConfirm();
  const { removeAssignment } = useDeleteAssignment();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${assignmentIds.length} selected assignment(s)?`,
        }).then(() => {
          removeAssignment({
            variables: { _ids: assignmentIds },
          })
            .then(() => {
              toast({
                title: `${assignmentIds.length} assignment(s) deleted successfully`,
                variant: 'success',
              });
            })
            .catch((e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
            });
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
