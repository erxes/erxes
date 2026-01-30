import { ScrollArea, Sheet } from 'erxes-ui';
import { AssignmentFormValues } from '../../constants/assignmentFormSchema';
import { AssignmentAddCampaignCoreFields } from './assignment-campaign-field/AssignmentAddCampaignCoreFields';
import { AssignmentAddCampaignMoreFields } from './assignment-campaign-field/AssignmentAddCampaignMoreFields';
import { UseFormReturn } from 'react-hook-form';

export function AddAssignmentCampaignForm({
  form: assignmentForm,
}: {
  form: UseFormReturn<AssignmentFormValues>;
}) {
  return (
    <Sheet.Content className="flex-auto overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-5 flex flex-col gap-5">
          <AssignmentAddCampaignCoreFields form={assignmentForm} />
          <AssignmentAddCampaignMoreFields form={assignmentForm} />
        </div>
      </ScrollArea>
    </Sheet.Content>
  );
}
