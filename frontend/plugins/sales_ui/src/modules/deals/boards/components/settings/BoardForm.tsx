import { Button, Form, Input, Sheet, Skeleton, Spinner, toast } from 'erxes-ui';
import {
  useAddBoardForm,
  useBoardAdd,
  useBoardDetail,
  useBoardEdit,
} from '@/deals/boards/hooks/useBoards';

import { IconPlus } from '@tabler/icons-react';
import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import { TBoardForm } from '@/deals/types/boards';
import { useQueryState } from 'erxes-ui';

export const BoardForm = () => {
  const [boardId, setBoardId] = useQueryState('boardId');

  const { methods } = useAddBoardForm();
  const { handleSubmit, reset } = methods;

  const [open, setOpen] = React.useState<boolean>(false);

  const { boardDetail, loading: boardDetailLoading } = useBoardDetail();

  React.useEffect(() => {
    setOpen(!!boardId);
    if (!boardId) reset();
  }, [boardId, reset]);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    setBoardId(null);
    reset();
  }, [reset, setBoardId]);

  const { addBoard, loading: addLoading } = useBoardAdd();
  const { editBoard, loading: editLoading } = useBoardEdit();

  const submitHandler: SubmitHandler<TBoardForm> = React.useCallback(
    async (data) => {
      const manageBoard = boardId ? editBoard : addBoard;
      const successTitle = boardId ? 'Updated a board' : 'Created a board';

      manageBoard({
        variables: {
          ...data,
        },
        onCompleted: () => {
          toast({ title: successTitle });
          handleClose();
        },
      });
    },
    [addBoard, editBoard, boardId, handleClose],
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) =>
        boardId ? !isOpen && handleClose() : setOpen(isOpen)
      }
    >
      <Sheet.Trigger asChild>
        <Button
          variant="ghost"
          className="text-xs font-semibold text-accent-foreground"
        >
          <IconPlus />
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className=" flex flex-col gap-0 w-full h-full"
          >
            <Sheet.Header>
              <Sheet.Title className="text-lg text-foreground flex items-center gap-1">
                {boardId ? 'Edit Board' : 'Add Board'}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4 gap-3">
              {boardDetailLoading ? (
                <Skeleton className="w-full h-4 my-1" />
              ) : (
                <Form.Field
                  control={methods.control}
                  name="name"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Board Name</Form.Label>
                      <Form.Control>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter board name"
                          className="input"
                          value={field.value || boardDetail?.name || ''}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'ghost'} onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={addLoading || editLoading}>
                {addLoading || editLoading ? <Spinner /> : 'Save'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
