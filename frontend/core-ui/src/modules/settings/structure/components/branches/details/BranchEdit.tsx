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
import { useQueryState, Form, cn, Breadcrumb, Button } from 'erxes-ui';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { BranchForm } from '@/settings/structure/components/branches/BranchForm';
import { BranchLocationField } from '@/settings/structure/components/branches/location/BranchLocationField';
import { useBranchEdit } from '@/settings/structure/hooks/useBranchActions';
import { PageHeader, RecordSidePanel } from 'ui-modules';
import { StructureSettingsBreadcrumb } from '@/settings/structure/components/StructureSettingsBreadcrumb';
interface BranchPageState {
  branchId: string;
  branchDraft: TBranchForm;
}

export const BranchEdit = ({ page = false }: { page?: boolean }) => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const [panelId, setOpen] = useQueryState<string>('branch_id');
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState: BranchPageState | null = location.state;
  const id = page ? branchId : panelId;
  const draft =
    page && navigationState && navigationState.branchId === id
      ? navigationState.branchDraft
      : undefined;
  const close = () => {
    if (page) navigate('/settings/structures/branches');
    else setOpen(null);
  };
  const { branchDetail, loading, error } = useBranchDetailsById({
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
    page,
    identity: id || 'new',
    name: 'settings/structure/branches/BranchEdit',
    open: !!id,
    onExpand: page
      ? undefined
      : () =>
          navigate(`/settings/structures/branches/${id}`, {
            state: { branchId: id, branchDraft: methods.getValues() },
          }),
    onOpenChange: (isOpen) => {
      if (!isOpen) {
        close();
      }
    },
  });
  const feedback = useStructureFormFeedback({
    isCurrent: pagePanel.isCurrent,
    message: t('branch-updated'),
    onSuccess: () => {
      methods.reset();
      close();
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
      reset({ ...rest, ...draft });
    }
  }, [branchDetail, draft, reset]);

  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded && pagePanel.allowed && branchDetail ? (
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className="flex min-h-0 w-full flex-1 flex-col"
          >
            {page ? (
              <PageHeader>
                <PageHeader.Start className="min-w-0 flex-1 pr-0">
                  <Breadcrumb>
                    <Breadcrumb.List className="flex-nowrap gap-1">
                      <Breadcrumb.Item>
                        <StructureSettingsBreadcrumb />
                      </Breadcrumb.Item>
                      <Breadcrumb.Separator />
                      <Breadcrumb.Item>
                        <Button variant="ghost" asChild>
                          <Link to="/settings/structures/branches">
                            {t('branches')}
                          </Link>
                        </Button>
                      </Breadcrumb.Item>
                      <Breadcrumb.Separator />
                      <Breadcrumb.Item className="min-w-0">
                        <Breadcrumb.Page
                          className="truncate px-3"
                          title={branchDetail.title}
                        >
                          {branchDetail.title}
                        </Breadcrumb.Page>
                      </Breadcrumb.Item>
                    </Breadcrumb.List>
                  </Breadcrumb>
                </PageHeader.Start>
              </PageHeader>
            ) : (
              <RecordSidePanel.Header
                avatar={<IconGitBranch size={16} />}
                title={branchDetail?.title || ''}
                {...pagePanel.headerProps}
              />
            )}
            <div
              className={cn(
                'min-h-0 flex-1 overflow-y-auto',
                page ? 'bg-muted/20 px-4 py-6 sm:px-6' : 'px-5 py-4',
              )}
            >
              {page ? (
                <div className="mx-auto grid w-full max-w-3xl items-start gap-6 @min-[960px]/record-panel:max-w-6xl @min-[960px]/record-panel:grid-cols-[minmax(0,1fr)_24rem]">
                  <div className="min-w-0 rounded-lg border bg-background p-5 sm:p-6">
                    <BranchForm showLocation={false} />
                  </div>
                  <div className="min-w-0 rounded-lg border bg-background p-5 sm:p-6">
                    <BranchLocationField />
                  </div>
                </div>
              ) : (
                <BranchForm />
              )}
            </div>
            <StructureFormActions
              onCancel={close}
              saving={isLoading}
              permission="branchesManage"
            />
          </form>
        </Form>
      ) : (
        <PagePanelStatus entry={pagePanel} loading={loading} error={!!error} />
      )}
    </div>,
    pagePanel,
  );
};
