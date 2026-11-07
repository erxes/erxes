import { type UseFormReturn } from 'react-hook-form';
import { RecordSidePanel } from 'ui-modules';
import { type PagePanelNavigation } from '@/side-panel/hooks/usePagePanel';
import { type IWorkhoursForm } from '@/settings/structure/types/workhours';
import { Fragment, type ReactNode } from 'react';
import { Form, Separator } from 'erxes-ui';
import { workingHours } from '@/settings/structure/constants/work-days';
import { type WorkDay } from '@/settings/structure/types/workhours';
import { WeekDayRow } from './WeekDayRow';
import { StructureFormActions } from '../StructureFormActions';

export const WorkhoursFormContent = ({
  children,
  onCancel,
  onSave,
  saving,
  permission,
  form,
  navigation,
  title,
}: {
  form: UseFormReturn<IWorkhoursForm>;
  navigation: PagePanelNavigation;
  title: string;
  children?: ReactNode;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  permission: 'branchesManage' | 'departmentsManage';
}) => (
  <Form {...form}>
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <RecordSidePanel.Header title={title} {...navigation} />
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col px-5">
        {Object.keys(workingHours).map((day, index) => (
          <Fragment key={day}>
            {index !== 0 && <Separator />}
            <WeekDayRow weekDay={day as WorkDay} />
          </Fragment>
        ))}
        {children}
      </div>
      <StructureFormActions
        onCancel={onCancel}
        onSave={onSave}
        saving={saving}
        permission={permission}
        cancelVariant="secondary"
      />
    </div>
  </Form>
);
