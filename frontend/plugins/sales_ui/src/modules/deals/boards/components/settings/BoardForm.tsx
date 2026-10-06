import {
  useAddBoardForm,
  useBoardAdd,
  useBoardDetail,
  useBoardEdit,
} from '@/deals/boards/hooks/useBoards';
import { TBoardForm } from '@/deals/types/boards';
import { IconX } from '@tabler/icons-react';
import { Button, Form, Input, Skeleton, toast, useQueryState } from 'erxes-ui';
import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface BoardFormProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export const BoardForm = ({ open, setOpen }: BoardFormProps) => {
  const [boardId, setBoardId] = useQueryState('boardId');
  const { methods } = useAddBoardForm();
  const { handleSubmit, reset } = methods;

  const { t } = useTranslation('sales');

  const { boardDetail, loading: boardDetailLoading } = useBoardDetail();
  const { addBoard, loading: addLoading } = useBoardAdd();
  const { editBoard, loading: editLoading } = useBoardEdit();

  React.useEffect(() => {
    setOpen(!!boardId);
    if (!boardId) reset();
  }, [boardId, reset]);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    setBoardId(null);
    reset();
  }, [reset, setBoardId, setOpen]);

  const submitHandler: SubmitHandler<TBoardForm> = React.useCallback(
    (data) => {
      if (!data.name?.trim()) {
        handleClose();
        return;
      }

      const manageBoard = boardId ? editBoard : addBoard;
      const successTitle = boardId ? t('board-updated') : t('board-created');

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
    [addBoard, editBoard, boardId, handleClose, t],
  );

  if (!open) return null;

  if (boardDetailLoading) {
    return <Skeleton className="w-full h-8 my-1" />;
  }

  return (
    <Form {...methods}>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="flex items-center gap-1 p-1 my-1"
      >
        <Form.Field
          control={methods.control}
          name="name"
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input
                  {...field}
                  type="text"
                  placeholder={t('enter-board-name')}
                  className="input"
                  value={field.value || boardDetail?.name || ''}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      handleClose();
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit(submitHandler)();
                    }
                  }}
                  ref={field.ref}
                  onBlur={() => {
                    field.onBlur();
                    handleSubmit(submitHandler)();
                  }}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-4 w-4 p-0"
          disabled={addLoading || editLoading}
          onClick={handleClose}
        >
          <IconX className="w-4 h-4" />
        </Button>
      </form>
    </Form>
  );
};
