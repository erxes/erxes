import {
  Button,
  Form,
  Sheet,
  Spinner,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
  useToast,
} from 'erxes-ui';
import { IconGitBranch, IconPlus } from '@tabler/icons-react';
import { PipelineHotKeyScope, TPipelineForm } from '@/deals/types/pipelines';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  usePipelineAdd,
  usePipelineDetail,
  usePipelineEdit,
} from '@/deals/boards/hooks/usePipelines';

import { PipelineForm } from './PipelineForm';
import { SubmitHandler } from 'react-hook-form';
import { usePipelineForm } from '@/deals/boards/hooks/usePipelineForm';
import { useStages } from '@/deals/stage/hooks/useStages';

export function PipelineFormBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const pipelineId = searchParams.get('pipelineId');
  const boardId = searchParams.get('activeBoardId');

  const {
    methods,
    methods: { reset, handleSubmit },
  } = usePipelineForm();

  const { stages: initialStages, loading: stagesLoading } = useStages({
    variables: {
      pipelineId,
    },
  });

  const { toast } = useToast();
  const [open, setOpen] = useState<boolean>(false);

  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const { pipelineDetail } = usePipelineDetail();

  useEffect(() => {
    if (initialStages?.length) {
      const mappedStages = initialStages.map((stage) => ({
        _id: stage._id || '',
        code: stage.code || '',
        name: stage.name || '',
        type: stage.type || '',
        visibility: stage.visibility || 'public',
        status: stage.status || 'active',
        age: stage.age || 0,
        canMoveMemberIds: stage.canMoveMemberIds ?? [],
        canEditMemberIds: stage.canEditMemberIds ?? [],
        probability: stage.probability || '',
      }));

      methods.setValue('stages', mappedStages, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [initialStages, methods]);

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      PipelineHotKeyScope.PipelineAddSheet,
    );
  };

  const onClose = useCallback(() => {
    setHotkeyScope(PipelineHotKeyScope.PipelineSettingsPage);
    setOpen(false);
    reset();

    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('pipelineId');
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });
  }, [location, navigate, reset, setHotkeyScope]);

  const { addPipeline, loading: addLoading } = usePipelineAdd();
  const { pipelineEdit, loading: editLoading } = usePipelineEdit();

  const submitHandler: SubmitHandler<TPipelineForm> = useCallback(
    async (data) => {
      const managePipeline = pipelineId ? pipelineEdit : addPipeline;
      const successTitle = pipelineId
        ? 'Pipeline updated successfully'
        : 'Pipeline added successfully';

      const variables = pipelineId
        ? { _id: pipelineId, ...data } // include _id for edit
        : { ...data };

      managePipeline({
        variables,
        onCompleted: () => {
          toast({ title: successTitle });
          onClose();
        },
      });
    },
    [addPipeline, pipelineEdit, pipelineId, toast, onClose],
  );

  useEffect(() => {
    if (pipelineId) {
      onOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, pipelineId]);

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

  const title = pipelineId ? 'Edit Pipeline' : 'Add Pipeline';

  useEffect(() => {
    if (pipelineId && pipelineDetail) {
      reset({
        name: pipelineDetail?.name || '',
        visibility: pipelineDetail?.visibility || 'public',
        boardId: pipelineDetail?.boardId || boardId || '',
        tagId: pipelineDetail?.tagId || '',
        departmentIds: pipelineDetail?.departmentIds || [],
        branchIds: pipelineDetail?.branchIds || [],
        memberIds: pipelineDetail?.memberIds || [],
        stages: methods.getValues('stages') || [],
        numberConfig: pipelineDetail?.numberConfig || '',
        numberSize: pipelineDetail?.numberSize || '',
        nameConfig: pipelineDetail?.nameConfig || '',
        isCheckDate: pipelineDetail?.isCheckDate || false,
        isCheckUser: pipelineDetail?.isCheckUser || false,
        isCheckDepartment: pipelineDetail?.isCheckDepartment || false,
      });
    } else {
      reset({
        name: '',
        visibility: 'public',
        boardId: boardId || '',
        tagId: '',
        departmentIds: [],
        branchIds: [],
        memberIds: [],
        stages: [],
        numberConfig: '',
        numberSize: '',
        nameConfig: '',
        isCheckDate: false,
        isCheckUser: false,
        isCheckDepartment: false,
      });
    }
  }, [pipelineId, pipelineDetail, reset, boardId, methods]);

  return (
    <div className="ml-auto flex items-center gap-3">
      <Sheet onOpenChange={(open) => (open ? onOpen() : onClose())} open={open}>
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus /> {title}
          </Button>
        </Sheet.Trigger>
        <Sheet.View
          className="p-0 md:max-w-screen-2xl"
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
                  Cancel
                </Button>
                <Button type="submit" disabled={addLoading || editLoading}>
                  {addLoading || editLoading ? <Spinner /> : 'Create'}
                </Button>
              </Sheet.Footer>
            </form>
          </Form>
        </Sheet.View>
      </Sheet>
    </div>
  );
}
