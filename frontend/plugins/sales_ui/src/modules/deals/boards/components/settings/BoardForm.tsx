import {
  useAddBoardForm,
  useBoardAdd,
  useBoardDetail,
  useBoardEdit,
} from '@/deals/boards/hooks/useBoards';
import { TBoardForm } from '@/deals/types/boards';
import {
  Button,
  Dialog,
  Form,
  Input,
  Skeleton,
  Spinner,
  toast,
  useQueryState,
} from 'erxes-ui';
import React from 'react';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';

const BoardFormBody = ({
  methods,
  onSubmit,
  onCancel,
  saving,
  detailLoading,
}: Readonly<{
  methods: UseFormReturn<TBoardForm>;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
  detailLoading: boolean;
}>) => (
  <Form {...methods}>
    <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-3">
        {detailLoading ? (
          <Skeleton className="w-full h-10 my-1" />
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
                    value={field.value || ''}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}
      </div>
      <Dialog.Footer className="pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || detailLoading}>
          {saving ? <Spinner /> : 'Save'}
        </Button>
      </Dialog.Footer>
    </form>
  </Form>
);

export const BoardForm = () => {
  const [boardId, setBoardId] = useQueryState<string>('boardId');
  const [createBoard, setCreateBoard] = useQueryState<string>('createBoard');
  const isCreating = Boolean(createBoard);

  const { methods } = useAddBoardForm();
  const { handleSubmit, reset } = methods;

  const [open, setOpen] = React.useState<boolean>(false);

  const { boardDetail, loading: boardDetailLoading } = useBoardDetail();

  React.useEffect(() => {
    setOpen(Boolean(boardId) || isCreating);
    if (!boardId) reset();
  }, [boardId, isCreating, reset]);

  React.useEffect(() => {
    if (boardId && boardDetail?._id === boardId) {
      reset({ name: boardDetail.name || '' }, { keepDefaultValues: true });
    }
  }, [boardId, boardDetail, reset]);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    setBoardId(null);
    setCreateBoard(null);
    reset();
  }, [reset, setBoardId, setCreateBoard]);

  const { addBoard, loading: addLoading } = useBoardAdd();
  const { editBoard, loading: editLoading } = useBoardEdit();

  const submitHandler: SubmitHandler<TBoardForm> = React.useCallback(
    async (data) => {
      const successTitle = boardId ? 'Updated a board' : 'Created a board';

      const onCompleted = () => {
        toast({ title: successTitle });
        handleClose();
      };
      if (boardId) {
        await editBoard({ variables: { ...data, _id: boardId }, onCompleted });
      } else {
        await addBoard({ variables: data, onCompleted });
      }
    },
    [addBoard, editBoard, boardId, handleClose],
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <Dialog.ContentCombined
        title={boardId ? 'Edit Board' : 'Add Board'}
        description={
          boardId ? 'Edit existing board details' : 'Create a new board'
        }
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <BoardFormBody
          methods={methods}
          onSubmit={handleSubmit(submitHandler)}
          onCancel={handleClose}
          saving={addLoading || editLoading}
          detailLoading={boardDetailLoading}
        />
      </Dialog.ContentCombined>
    </Dialog>
  );
};
