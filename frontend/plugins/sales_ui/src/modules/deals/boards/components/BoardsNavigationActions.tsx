import { useBoardAdd } from '@/deals/boards/hooks/useBoards';
import { boardCreateDialogState } from '@/deals/states/boardCreateDialogState';
import { TBoardForm } from '@/deals/types/boards';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  Dialog,
  Form,
  Input,
  Spinner,
  useMultiQueryState,
  useToast,
} from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

type TBoardSelection = {
  boardId: string;
  pipelineId: string;
  stageId: string;
};

export const BoardCreateDialog = () => {
  const { t } = useTranslation('sales');
  const [open, setOpen] = useAtom(boardCreateDialogState);
  const { toast } = useToast();
  const [, setBoardSelection] = useMultiQueryState<TBoardSelection>([
    'boardId',
    'pipelineId',
    'stageId',
  ]);

  const schema = useMemo(
    () => z.object({ name: z.string().trim().min(1, t('name-required')) }),
    [t],
  );

  const form = useForm<TBoardForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  const { addBoard, loading } = useBoardAdd();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) form.reset();
    setOpen(nextOpen);
  };

  const onSubmit = (data: TBoardForm) =>
    addBoard({
      variables: { name: data.name },
      onCompleted: (result) => {
        toast({ title: t('board-created') });
        const newBoardId = result.salesBoardsAdd?._id;
        if (newBoardId) {
          localStorage.setItem('erxesCurrentBoardId', newBoardId);
          localStorage.removeItem('erxesCurrentPipelineId');
          setBoardSelection({
            boardId: newBoardId,
            pipelineId: null,
            stageId: null,
          });
        }
        handleOpenChange(false);
      },
      onError: (error) =>
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        }),
    });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Dialog.ContentCombined
        title={t('add-board')}
        description={t('create-new-board')}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 w-full"
          >
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('board-name')}</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      autoFocus
                      placeholder={t('enter-board-name')}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Dialog.Footer className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : t('create')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.ContentCombined>
    </Dialog>
  );
};

export const BoardsNavigationActions = () => {
  const { t } = useTranslation('sales');
  const setBoardDialogOpen = useSetAtom(boardCreateDialogState);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground"
      aria-label={t('add-board')}
      onClick={(event) => {
        event.stopPropagation();
        setBoardDialogOpen(true);
      }}
    >
      <IconPlus className="size-4" />
    </Button>
  );
};
