import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { ISegment } from 'ui-modules';
import { Row } from '@tanstack/table-core';

export const SegmentRemoveButtonCommandBar = ({
  automationIds,
  rows,
}: {
  automationIds: string[];
  rows: Row<ISegment>[];
}) => {
  //   const { confirm } = useConfirm();
  // //   const { removeAutomations } = useRemoveAutomations();
  //   const { toast } = useToast();
  //   return (
  //     <Button
  //       variant="secondary"
  //       className="text-destructive"
  //       onClick={() =>
  //         confirm({
  //           message: `Are you sure you want to delete the ${automationIds.length} selected automations?`,
  //         }).then(() => {
  //           removeAutomations(automationIds, {
  //             onError: (e: ApolloError) => {
  //               toast({
  //                 title: 'Error',
  //                 description: e.message,
  //                 variant: 'destructive',
  //               });
  //             },
  //             onCompleted: () => {
  //               rows.forEach((row) => {
  //                 row.toggleSelected(false);
  //               });
  //               toast({
  //                 title: 'Success',
  //                 variant: 'default',
  //               });
  //             },
  //           });
  //         })
  //       }
  //     >
  //       <IconTrash />
  //       Delete
  //     </Button>
  //   );
};
