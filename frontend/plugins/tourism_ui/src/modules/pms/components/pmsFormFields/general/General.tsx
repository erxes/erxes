import { Control } from 'react-hook-form';
import { Form, Input, Textarea, InfoCard } from 'erxes-ui';
import PmsFormFieldsLayout from '../PmsFormFieldsLayout';
import CheckInCheckOutTime from './CheckInCheckOutTime';
import Discount from './Discount';
// import Lock from './Lock';
import { PmsBranchFormType } from '@/pms/constants/formSchema';

const General = ({ control }: { control: Control<PmsBranchFormType> }) => {
  return (
    <PmsFormFieldsLayout>
      <div className="space-y-3">
        <InfoCard title="Basic Information">
          <InfoCard.Content className="space-y-2">
            <Form.Field
              control={control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    Name <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="Write here" />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />

            <Form.Field
              control={control}
              name="description"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Description</Form.Label>
                  <Form.Control>
                    <Textarea {...field} placeholder="Description..." />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />
          </InfoCard.Content>
        </InfoCard>

        <InfoCard title="Check In Check Out Time">
          <InfoCard.Content>
            <CheckInCheckOutTime control={control} />
          </InfoCard.Content>
        </InfoCard>

        <InfoCard title="Discount">
          <InfoCard.Content>
            <Discount control={control} />
          </InfoCard.Content>
        </InfoCard>

        {/* <InfoCard title="Lock">
          <InfoCard.Content>
            <Lock control={control} />
          </InfoCard.Content>
        </InfoCard> */}
      </div>
    </PmsFormFieldsLayout>
  );
};

export default General;
