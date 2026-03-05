import { Control } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { TPosOrderFormData } from '../types/posOrderType';

interface PosOrderFormProps {
  control: Control<TPosOrderFormData>;
}

export const PosOrderForm = ({ control }: PosOrderFormProps) => {
  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={control}
        name="cashAmount"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Cash amount</Form.Label>
            <Form.Description className="sr-only">Cash amount</Form.Description>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="mobileAmount"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Mobile amount</Form.Label>
            <Form.Description className="sr-only">
              Mobile amount
            </Form.Description>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="spendPoints"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Spend points</Form.Label>
            <Form.Description className="sr-only">
              Spend points
            </Form.Description>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
