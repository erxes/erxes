import { Control, useFieldArray } from 'react-hook-form';
import { Button, Form, Input, InfoCard } from 'erxes-ui';
import PmsFormFieldsLayout from '../PmsFormFieldsLayout';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { PmsBranchFormType } from '@/pms/constants/formSchema';
import { SelectPayment } from '@/pms/components/payment/SelectPayment';

const Payments = ({ control }: { control: Control<PmsBranchFormType> }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'otherPayments',
  });

  return (
    <PmsFormFieldsLayout>
      <div className="space-y-3">
        <InfoCard title="Payments">
          <InfoCard.Content>
            <Form.Field
              control={control}
              name="paymentIds"
              render={({ field }) => (
                <Form.Item className="flex flex-col">
                  <Form.Label>Payments</Form.Label>

                  <Form.Control>
                    <SelectPayment.FormItem
                      mode="multiple"
                      value={field.value || []}
                      onValueChange={(value) => {
                        field.onChange(Array.isArray(value) ? value : []);
                      }}
                      placeholder="Choose payments"
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />

            <Form.Field
              control={control}
              name="erxesAppToken"
              render={({ field }) => (
                <Form.Item className="flex flex-col">
                  <Form.Label>Erxes App Token</Form.Label>

                  <Form.Control>
                    <Input {...field} placeholder="Enter erxes app token" />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />
          </InfoCard.Content>
        </InfoCard>

        <InfoCard title="Other payments">
          <InfoCard.Content>
            <p className="text-sm text-muted-foreground">
              type must use latin characters, some default types: golomtCard,
              khaanCard, TDBCard
              <br />
              Хэрэв тухайн төлбөрт ебаримт хэвлэхгүй бол: "skipEbarimt: true",
              Харилцагч сонгосон үед л харагдах бол: "mustCustomer: true", Хэрэв
              хуваах боломжгүй бол: "notSplit: true" Урьдчилж төлсөн төлбөрөөр
              (Татвар тооцсон) бол: "preTax: true" Хэрэв тухайн төлбөр дээр
              бэлдэц нэхэмжлэх хэвлэх бол: "printInvoice: true"
            </p>

            <Button className="w-fit" type="button" onClick={() => append({})}>
              <IconPlus /> Add payments method
            </Button>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-6 items-end">
                <div className="grid grid-cols-3 gap-6 w-full">
                  <Form.Field
                    control={control}
                    name={`otherPayments.${index}.type`}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Type</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={control}
                    name={`otherPayments.${index}.title`}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Title</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={control}
                    name={`otherPayments.${index}.config`}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Config</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </div>

                <Button
                  variant={'destructive'}
                  size={'icon'}
                  type="button"
                  className="w-8 h-8"
                  onClick={() => remove(index)}
                >
                  <IconTrash />
                </Button>
              </div>
            ))}
          </InfoCard.Content>
        </InfoCard>
      </div>
    </PmsFormFieldsLayout>
  );
};

export default Payments;
