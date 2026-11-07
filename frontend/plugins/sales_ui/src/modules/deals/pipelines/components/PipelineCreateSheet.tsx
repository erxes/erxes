import { usePipelineForm } from '@/deals/boards/hooks/usePipelineForm';
import { PipelineForm } from '@/deals/pipelines/components/PipelineForm';
import { usePipelineFormSubmit } from '@/deals/pipelines/hooks/usePipelineFormSubmit';
import { usePipelineFormSync } from '@/deals/pipelines/hooks/usePipelineFormSync';
import { pipelineCreateBoardIdState } from '@/deals/states/pipelineCreateSheetState';
import type { IStage } from '@/deals/types/stages';
import { IconGitBranch } from '@tabler/icons-react';
import { Button, Form, Sheet, useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

const NO_STAGES: IStage[] = [];

const PipelineCreateForm = ({
  boardId,
  onClose,
}: {
  boardId: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('sales');
  const { methods } = usePipelineForm();

  usePipelineFormSync({
    boardId,
    initialStages: NO_STAGES,
    methods,
    pipelineDetail: undefined,
    pipelineId: null,
  });

  const { handleFormSubmit, loading } = usePipelineFormSubmit({
    methods,
    onCompleted: onClose,
    pipelineId: null,
  });

  return (
    <Form {...methods}>
      <form
        onSubmit={(event) => void handleFormSubmit(event)}
        className="flex flex-col gap-0 w-full h-full"
      >
        <Sheet.Header>
          <Sheet.Title className="text-lg text-foreground flex items-center gap-1">
            <IconGitBranch size={16} />
            {t('add-pipeline')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col overflow-hidden">
          <PipelineForm
            form={methods}
            stagesLoading={false}
            pipelineId={null}
          />
        </Sheet.Content>
        <Sheet.Footer>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {t('create')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

export const PipelineCreateSheet = () => {
  const [boardId, setBoardId] = useAtom(pipelineCreateBoardIdState);
  const [, setActiveTab] = useQueryState<string>('tab');

  const handleClose = () => {
    setBoardId(null);
    setActiveTab(null);
  };

  return (
    <Sheet
      open={!!boardId}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Sheet.View
        className="p-0 md:max-w-6xl"
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        {boardId && (
          <PipelineCreateForm boardId={boardId} onClose={handleClose} />
        )}
      </Sheet.View>
    </Sheet>
  );
};
