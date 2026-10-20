import { useBoards } from '@/deals/boards/hooks/useBoards';
import { usePipelineDetail } from '@/deals/boards/hooks/usePipelines';
import { PipelineHotKeyScope } from '@/deals/types/pipelines';
import { IconGitBranch, IconPlus } from '@tabler/icons-react';
import {
  Button,
  Form,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { usePipelineForm } from '@/deals/boards/hooks/usePipelineForm';
import { LoyaltyRulesDialog } from '@/deals/loyaltyRules/components/LoyaltyRulesDialog';
import { usePipelineFormSubmit } from '@/deals/pipelines/hooks/usePipelineFormSubmit';
import { usePipelineFormSync } from '@/deals/pipelines/hooks/usePipelineFormSync';
import { useStages } from '@/deals/stage/hooks/useStages';
import { useTranslation } from 'react-i18next';
import { PipelineForm } from './PipelineForm';

export function PipelineFormBar() {
  const { t } = useTranslation('sales');
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const pipelineId = searchParams.get('pipelineId');
  const boardId = searchParams.get('activeBoardId');
  const { boards, loading: boardsLoading } = useBoards();
  const isCreateDisabled =
    !pipelineId &&
    (boardsLoading || !boards?.some((board) => board._id === boardId));

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

  const paymentTypesError = usePipelineFormSync({
    boardId,
    initialStages,
    methods,
    pipelineDetail,
    pipelineId,
  });

  const onOpen = useCallback(() => {
    if (isCreateDisabled) return;

    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      PipelineHotKeyScope.PipelineAddSheet,
    );
  }, [isCreateDisabled, setHotkeyScopeAndMemorizePreviousScope]);

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
      <LoyaltyRulesDialog />
      <Sheet onOpenChange={(open) => (open ? onOpen() : onClose())} open={open}>
        <Sheet.Trigger asChild>
          <Button disabled={isCreateDisabled}>
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
              onSubmit={(event) => {
                if (paymentTypesError) event.preventDefault();
                else void handleFormSubmit(event);
              }}
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
                {paymentTypesError && (
                  <p role="alert" className="p-4 text-destructive">
                    {t(
                      'invalid-payment-settings',
                      'Unable to read payment settings. Saving is disabled.',
                    )}
                  </p>
                )}
                <PipelineForm
                  form={methods}
                  stagesLoading={stagesLoading}
                  pipelineId={pipelineId}
                />
              </Sheet.Content>
              <Sheet.Footer>
                <Button variant={'ghost'} onClick={onClose}>
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    submitLoading || isCreateDisabled || !!paymentTypesError
                  }
                >
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
