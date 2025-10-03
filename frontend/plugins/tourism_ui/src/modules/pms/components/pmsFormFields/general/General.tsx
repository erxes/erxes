import { Control } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import PmsFormFieldsLayout from '../PmsFormFieldsLayout';
import Heading from '../../ui/heading';
import CheckInCheckOutTime from './CheckInCheckOutTime';
import Discount from './Discount';
import Lock from './Lock';
import { PmsBranchFormType } from '@/pms/constants/formSchema';

const General = ({ control }: { control: Control<PmsBranchFormType> }) => {
  return (
    <PmsFormFieldsLayout>
      <div className="space-y-4">
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
                <Input {...field} placeholder="Description..." />
              </Form.Control>
              <Form.Message className="text-destructive" />
            </Form.Item>
          )}
        />
      </div>

      <Heading className="mt-2">SETUP CHECK IN CHECK OUT TIME</Heading>
      <CheckInCheckOutTime control={control} />

      <Heading className="mt-2">Discount</Heading>
      <Discount control={control} />

      <Heading className="mt-2">Lock</Heading>
      <Lock control={control} />
    </PmsFormFieldsLayout>
  );
};

export default General;
