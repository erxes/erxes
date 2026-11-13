import { useStructureFormFeedback } from '@/settings/structure/hooks/useStructureFormFeedback';
import { StructureFormActions } from '@/settings/structure/components/StructureFormActions';
import { TUnitForm } from '@/settings/structure/types/unit';
import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { useQueryState, Form, cn } from 'erxes-ui';
import { useEffect } from 'react';
import { useUnitDetailsById } from '@/settings/structure/hooks/useUnitDetailsById';
import { useUnitEdit } from '@/settings/structure/hooks/useUnitActions';
import { useUnitForm } from '@/settings/structure/hooks/useUnitForm';
import { IconUsersGroup } from '@tabler/icons-react';
import { UnitForm } from '@/settings/structure/components/units/UnitForm';
import { RecordSidePanel } from 'ui-modules';
export const UnitEdit = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const [id, setOpen] = useQueryState<string>('unit_id');
  const { unitDetail, loading } = useUnitDetailsById({
    variables: {
      id,
    },
  });
  const { handleEdit, loading: isLoading } = useUnitEdit();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useUnitForm();
  const pagePanel = usePagePanel({
    expandable: false,
    identity: id || 'new',
    name: 'settings/structure/units/UnitEdit',
    open: !!id,
    onOpenChange: (isOpen) => {
      if (!isOpen) {
        setOpen(null);
      }
    },
  });
  const feedback = useStructureFormFeedback({
    isCurrent: pagePanel.isCurrent,
    message: t('unit-updated'),
    onSuccess: () => {
      methods.reset();
      setOpen(null);
    },
  });
  const submitHandler: SubmitHandler<TUnitForm> = (data) => {
    handleEdit({
      variables: {
        ...data,
        id,
      },
      ...feedback,
    });
  };
  useEffect(() => {
    if (unitDetail) {
      const { __typename, _id, ...rest } = unitDetail;
      void __typename;
      void _id;
      reset(rest);
    }
  }, [unitDetail, reset]);

  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded && pagePanel.allowed ? (
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className=" flex flex-col gap-0 w-full h-full"
          >
            <RecordSidePanel.Header
              avatar={<IconUsersGroup size={16} />}
              title={unitDetail?.title || ''}
              {...pagePanel.headerProps}
            />
            <div
              className={cn(
                'flex min-h-0 flex-1 flex-col overflow-y-auto',
                'grow size-full h-auto flex flex-col px-5 py-4',
              )}
            >
              <UnitForm loading={loading} />
            </div>
            <StructureFormActions
              onCancel={() => setOpen(null)}
              saving={isLoading}
              permission="unitsManage"
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
