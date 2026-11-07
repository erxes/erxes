import { useStructureFormFeedback } from '@/settings/structure/hooks/useStructureFormFeedback';
import { StructureFormActions } from '@/settings/structure/components/StructureFormActions';
import { TBranchForm } from '@/settings/structure/types/branch';
import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { useBranchDetailsById } from '@/settings/structure/hooks/useBranchDetailsById';
import { useBranchForm } from '@/settings/structure/hooks/useBranchForm';
import { IconGitBranch } from '@tabler/icons-react';
import { useQueryState, Form, cn } from 'erxes-ui';
import { useEffect } from 'react';
import { BranchForm } from '@/settings/structure/components/branches/BranchForm';
import { useBranchEdit } from '@/settings/structure/hooks/useBranchActions';
import { RecordSidePanel } from 'ui-modules';
export const BranchEdit = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const [id, setOpen] = useQueryState<string>('branch_id');
  const { branchDetail } = useBranchDetailsById({
    variables: {
      id,
    },
  });
  const { handleEdit, loading: isLoading } = useBranchEdit();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useBranchForm();
  const pagePanel = usePagePanel({
    identity: id || 'new',
    name: 'settings/structure/branches/BranchEdit',
    open: !!id,
    onOpenChange: (isOpen) => {
      if (!isOpen) {
        setOpen(null);
      }
    },
  });
  const feedback = useStructureFormFeedback({
    isCurrent: pagePanel.isCurrent,
    message: t('branch-updated'),
    onSuccess: () => {
      methods.reset();
      setOpen(null);
    },
  });
  const submitHandler: SubmitHandler<TBranchForm> = (data) => {
    handleEdit({
      variables: {
        ...data,
        id,
      },
      ...feedback,
    });
  };
  useEffect(() => {
    if (branchDetail) {
      const { __typename, _id, ...rest } = branchDetail;
      void __typename;
      void _id;
      reset(rest);
    }
  }, [branchDetail, reset]);

  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded && pagePanel.allowed ? (
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className=" flex flex-col gap-0 w-full h-full"
          >
            <RecordSidePanel.Header
              avatar={<IconGitBranch size={16} />}
              title={branchDetail?.title || ''}
              {...pagePanel.headerProps}
            />
            <div
              className={cn(
                'flex min-h-0 flex-1 flex-col overflow-y-auto',
                'grow size-full h-auto flex flex-col px-5 py-4',
              )}
            >
              <BranchForm />
            </div>
            <StructureFormActions
              onCancel={() => setOpen(null)}
              saving={isLoading}
              permission="branchesManage"
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
