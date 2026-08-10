import {
  Button,
  Form,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { IconGitBranch, IconPlus } from '@tabler/icons-react';
import { PipelineHotKeyScope } from '@/deals/types/pipelines';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePipelineDetail } from '@/deals/boards/hooks/usePipelines';

import { PipelineForm } from './PipelineForm';
import { useTranslation } from 'react-i18next';
import { usePipelineForm } from '@/deals/boards/hooks/usePipelineForm';
import { useStages } from '@/deals/stage/hooks/useStages';
import { usePipelineFormSubmit } from '@/deals/pipelines/hooks/usePipelineFormSubmit';
import { usePipelineFormSync } from '@/deals/pipelines/hooks/usePipelineFormSync';

export function PipelineFormBar() {
  const { t } = useTranslation('sales');
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const pipelineId = searchParams.get('pipelineId');
  const boardId = searchParams.get('activeBoardId');

  const {
    methods,
    methods: { reset },
  } = usePipelineForm();

  const { stages: initialStages, loading: stagesLoading } = useStages({
    variables: {
      pipelineId,
      isAll: true,
    },
  });

  const [open, setOpen] = useState<boolean>(false);

  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const { pipelineDetail } = usePipelineDetail();

  usePipelineFormSync({
    boardId,
    initialStages,
    methods,
    pipelineDetail,
    pipelineId,
  });

  const onOpen = useCallback(() => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      PipelineHotKeyScope.PipelineAddSheet,
    );
  }, [setHotkeyScopeAndMemorizePreviousScope]);

  const onClose = useCallback(() => {
    setHotkeyScope(PipelineHotKeyScope.PipelineSettingsPage);
    setOpen(false);
    reset();

    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('pipelineId');
    searchParams.delete('tab');
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });
  }, [location, navigate, reset, setHotkeyScope]);

  const { handleFormSubmit, loading: submitLoading } = usePipelineFormSubmit({
    methods,
    onCompleted: onClose,
    pipelineId,
  });

  useEffect(() => {
    if (pipelineId) {
      onOpen();
    }
  }, [location.search, onOpen, pipelineId]);

  useScopedHotkeys(
    `c`,
    () => onOpen(),
    PipelineHotKeyScope.PipelineSettingsPage,
  );
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    PipelineHotKeyScope.PipelineAddSheet,
  );

  const title = pipelineId ? t('edit-pipeline') : t('add-pipeline');

  return (
    <div className="ml-auto flex items-center gap-3">
      <Sheet onOpenChange={(open) => (open ? onOpen() : onClose())} open={open}>
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus /> {title}
          </Button>
        </Sheet.Trigger>
        <Sheet.View
          className="p-0 md:max-w-6xl"
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <Form {...methods}>
            <form
              onSubmit={handleFormSubmit}
              className=" flex flex-col gap-0 w-full h-full"
            >
              <Sheet.Header>
                <Sheet.Title className="text-lg text-foreground flex items-center gap-1">
                  <IconGitBranch size={16} />
                  {title}
                </Sheet.Title>
                <Sheet.Close />
              </Sheet.Header>
              <Sheet.Content className="grow size-full h-auto flex flex-col overflow-hidden">
                <PipelineForm form={methods} stagesLoading={stagesLoading} />
              </Sheet.Content>
              <Sheet.Footer>
                <Button variant={'ghost'} onClick={onClose}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={submitLoading}>
                  {pipelineId ? t('update') : t('create')}
                </Button>
              </Sheet.Footer>
            </form>
          </Form>
        </Sheet.View>
      </Sheet>
    </div>
  );
}
