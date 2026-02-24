import { Control } from 'react-hook-form';
import { Form, InfoCard } from 'erxes-ui';
import { SelectMember } from 'ui-modules';
import PmsFormFieldsLayout from '../PmsFormFieldsLayout';
import { PmsBranchFormType } from '@/pms/constants/formSchema';

interface Props {
  control: Control<PmsBranchFormType>;
}

const roleFields = [
  { name: 'user1Ids', label: 'General Managers' },
  { name: 'user2Ids', label: 'Managers' },
  { name: 'user3Ids', label: 'Reservation Managers' },
  { name: 'user4Ids', label: 'Reception' },
  { name: 'user5Ids', label: 'Housekeeper' },
] as const;

const Admins = ({ control }: Props) => {
  return (
    <PmsFormFieldsLayout>
      <InfoCard title="Users">
        <InfoCard.Content>
          {roleFields.map(({ name, label }) => (
            <Form.Field
              key={name}
              control={control}
              name={name}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {label} <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <SelectMember
                      mode="multiple"
                      value={field.value || []}
                      onValueChange={(value) => field.onChange(value)}
                      placeholder="Choose team member"
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />
          ))}
        </InfoCard.Content>
      </InfoCard>
    </PmsFormFieldsLayout>
  );
};

export default Admins;
