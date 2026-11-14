import { useWorkhoursPanel } from '@/settings/structure/hooks/useWorkhoursPanel';
import { WorkhoursFormContent } from '@/settings/structure/components/workhours/WorkhoursFormContent';
import {
  IWorkDay,
  IWorkhoursForm,
  WorkDay,
} from '@/settings/structure/types/workhours';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { createPagePanelPortal as createPortal } from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { workingHours } from '@/settings/structure/constants/work-days';
import { useEffect } from 'react';
import { useDepartmentDetailsById } from '@/settings/structure/hooks/useDepartmentDetailsById';
import { useDepartmentInlineEdit } from '@/settings/structure/hooks/useDepartmentActions';
export const DepartmentWorkingHoursSheet = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const { workingHoursId, form, pagePanel, close } = useWorkhoursPanel(
    'settings/structure/departments/DepartmentWorkingHoursSheet',
  );
  const { departmentDetail } = useDepartmentDetailsById({
    variables: {
      id: workingHoursId,
    },
    skip: !workingHoursId,
  });
  const { departmentsEdit, loading } = useDepartmentInlineEdit();
  const onSubmit = (values: IWorkhoursForm) => {
    const activeDays: Partial<Record<WorkDay, IWorkDay>> = {};
    Object.values(WorkDay).forEach((day) => {
      const data = values[day];
      if (data && !data.inactive) {
        activeDays[day] = {
          startFrom: data.startFrom,
          endTo: data.endTo,
          lunchStartFrom: data.lunchStartFrom,
          lunchEndTo: data.lunchEndTo,
          inactive: false,
        };
      }
    });
    const payload = Object.keys(activeDays).length ? activeDays : null;
    departmentsEdit(
      {
        variables: {
          id: workingHoursId,
          code: departmentDetail?.code,
          workhours: payload,
        },
      },
      ['code', 'workhours'],
    );
  };
  useEffect(() => {
    if (departmentDetail) {
      const initialValues = departmentDetail.workhours ?? {};
      const mergedValues = Object.fromEntries(
        Object.entries(workingHours).map(([day, defaults]) => [
          day,
          {
            ...(defaults || {}),
            ...((initialValues as Record<string, any>)[day] || {}),
          },
        ]),
      ) as IWorkhoursForm;
      form.reset(mergedValues);
    }
  }, [departmentDetail, form]);

  return createPortal(
    pagePanel.permissionsLoaded && pagePanel.allowed ? (
      <WorkhoursFormContent
        title={t('setup-department-working-hours')}
        form={form}
        navigation={pagePanel.headerProps}
        onCancel={close}
        onSave={form.handleSubmit(onSubmit)}
        saving={loading}
        permission="departmentsManage"
      ></WorkhoursFormContent>
    ) : (
      <PagePanelStatus entry={pagePanel} />
    ),
    pagePanel,
  );
};
