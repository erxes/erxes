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
import { useEffect, useRef } from 'react';
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
  const hydratedId = useRef<string>();
  const pagePanel = usePagePanel({
    page,
    identity: id || 'new',
    name: 'settings/structure/branches/BranchEdit',
    open: !!id,
    onExpand: page
      ? undefined
      : () =>
          navigate(`/settings/structures/branches/${id}`, {
            state:
              hydratedId.current === id
                ? { branchId: id, branchDraft: methods.getValues() }
                : undefined,
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
    if (id && branchDetail && branchDetail._id === id) {
      const { __typename, _id, ...rest } = branchDetail;
      void __typename;
      void _id;
      reset({ ...rest, ...draft });
      hydratedId.current = id;
    }
  }, [branchDetail, draft, reset, id]);

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
                            {t('branches', 'Branches')}
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
                page ? 'p-4' : 'px-5 py-4',
              )}
            >
              {page ? (
                <div className="grid w-full items-start gap-x-6 gap-y-4 @min-[960px]/record-panel:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.2fr)]">
                  <div className="min-w-0 space-y-3">
                    <BranchForm showLocation={false} compact />
                    <StructureFormActions
                      onCancel={close}
                      saving={isLoading}
                      permission="branchesManage"
                    />
                  </div>
                  <div className="min-w-0 border-t pt-4 @min-[960px]/record-panel:border-l @min-[960px]/record-panel:border-t-0 @min-[960px]/record-panel:pl-6 @min-[960px]/record-panel:pt-0">
                    <BranchLocationField mapClassName="h-[clamp(22rem,50vh,36rem)]" />
                  </div>
                </div>
              ) : (
                <BranchForm />
              )}
            </div>
            {!page && (
              <StructureFormActions
                onCancel={close}
                saving={isLoading}
                permission="branchesManage"
              />
            )}
          </form>
        </Form>
      ) : (
        <PagePanelStatus entry={pagePanel} loading={loading} error={!!error} />
      )}
    </div>,
    pagePanel,
  );
};
