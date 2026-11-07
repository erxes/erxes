import { useStructureFormFeedback } from '@/settings/structure/hooks/useStructureFormFeedback';
import { StructureFormActions } from '@/settings/structure/components/StructureFormActions';
import { TDepartmentForm } from '@/settings/structure/types/department';
import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { IconFolder } from '@tabler/icons-react';
import { useQueryState, Form, cn } from 'erxes-ui';
import { useEffect } from 'react';
import { useDepartmentDetailsById } from '@/settings/structure/hooks/useDepartmentDetailsById';
import { useDepartmentEdit } from '@/settings/structure/hooks/useDepartmentActions';
import { useDepartmentForm } from '@/settings/structure/hooks/useDepartmentForm';
import { DepartmentForm } from '@/settings/structure/components/departments/DepartmentForm';
import { RecordSidePanel } from 'ui-modules';
export const DepartmentEdit = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const [id, setOpen] = useQueryState<string>('department_id');
  const { departmentDetail } = useDepartmentDetailsById({
    variables: {
      id,
    },
  });
  const { handleEdit, loading: isLoading } = useDepartmentEdit();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useDepartmentForm();
  const pagePanel = usePagePanel({
    expandable: false,
    identity: id || 'new',
    name: 'settings/structure/departments/DepartmentEdit',
    open: !!id,
    onOpenChange: (isOpen) => {
      if (!isOpen) {
        setOpen(null);
      }
    },
  });
  const feedback = useStructureFormFeedback({
    isCurrent: pagePanel.isCurrent,
    message: t('department-updated'),
    onSuccess: () => {
      methods.reset();
      setOpen(null);
    },
  });
  const submitHandler: SubmitHandler<TDepartmentForm> = (data) => {
    handleEdit({
      variables: {
        ...data,
        id,
      },
      ...feedback,
    });
  };
  useEffect(() => {
    if (departmentDetail) {
      const { __typename, _id, ...rest } = departmentDetail;
      void __typename;
      void _id;
      reset(rest);
    }
  }, [departmentDetail, reset]);

  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded && pagePanel.allowed ? (
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className=" flex flex-col gap-0 w-full h-full"
          >
            <RecordSidePanel.Header
              avatar={<IconFolder size={16} />}
              title={departmentDetail?.title || ''}
              {...pagePanel.headerProps}
            />
            <div
              className={cn(
                'flex min-h-0 flex-1 flex-col overflow-y-auto',
                'grow size-full h-auto flex flex-col px-5 py-4',
              )}
            >
              <DepartmentForm />
            </div>
            <StructureFormActions
              onCancel={() => setOpen(null)}
              saving={isLoading}
              permission="departmentsManage"
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
