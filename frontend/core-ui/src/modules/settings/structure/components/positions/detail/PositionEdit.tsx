import { useStructureFormFeedback } from '@/settings/structure/hooks/useStructureFormFeedback';
import { StructureFormActions } from '@/settings/structure/components/StructureFormActions';
import { TPositionForm } from '@/settings/structure/types/position';
import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { useQueryState, Form, cn } from 'erxes-ui';
import { useEffect } from 'react';
import { IconBriefcase } from '@tabler/icons-react';
import { usePositionDetailsById } from '@/settings/structure/hooks/usePositionDetailsById';
import { usePositionEdit } from '@/settings/structure/hooks/usePositionActions';
import { usePositionForm } from '@/settings/structure/hooks/usePositionForm';
import { PositionForm } from '@/settings/structure/components/positions/PositionForm';
import { RecordSidePanel } from 'ui-modules';
export const PositionEdit = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const [id, setOpen] = useQueryState<string>('position_id');
  const { positionDetail, loading } = usePositionDetailsById({
    variables: {
      id,
    },
  });
  const { handleEdit, loading: isLoading } = usePositionEdit();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = usePositionForm();
  const pagePanel = usePagePanel({
    identity: id || 'new',
    name: 'settings/structure/positions/PositionEdit',
    open: !!id,
    onOpenChange: (isOpen) => {
      if (!isOpen) {
        setOpen(null);
      }
    },
  });
  const feedback = useStructureFormFeedback({
    isCurrent: pagePanel.isCurrent,
    message: t('position-updated'),
    onSuccess: () => {
      methods.reset();
      setOpen(null);
    },
  });
  const submitHandler: SubmitHandler<TPositionForm> = (data) => {
    handleEdit({
      variables: {
        ...data,
        id,
      },
      ...feedback,
    });
  };
  useEffect(() => {
    if (positionDetail) {
      const { __typename, _id, ...rest } = positionDetail;
      void __typename;
      void _id;
      reset(rest);
    }
  }, [positionDetail, reset]);

  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded && pagePanel.allowed ? (
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className=" flex flex-col gap-0 w-full h-full"
          >
            <RecordSidePanel.Header
              avatar={<IconBriefcase size={16} />}
              title={positionDetail?.title || ''}
              {...pagePanel.headerProps}
            />
            <div
              className={cn(
                'flex min-h-0 flex-1 flex-col overflow-y-auto',
                'grow size-full h-auto flex flex-col px-5 py-4',
              )}
            >
              <PositionForm loading={loading} />
            </div>
            <StructureFormActions
              onCancel={() => setOpen(null)}
              saving={isLoading}
              permission="positionsManage"
            />
          </form>
        </Form>
      ) : (
        <PagePanelStatus entry={pagePanel} />
      )}
    </div>,
    pagePanel,
  );
};
