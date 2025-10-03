import { Control, useFieldArray } from 'react-hook-form';
import {
  Button,
  Form,
  Input,
  MultipleSelector,
  MultiSelectOption,
} from 'erxes-ui';
import PmsFormFieldsLayout from '../PmsFormFieldsLayout';
import Heading from '../../ui/heading';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { PmsBranchFormType } from '@/pms/constants/formSchema';

const Payments = ({ control }: { control: Control<PmsBranchFormType> }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'otherPayments',
  });

  const options: MultiSelectOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'orange', label: 'Orange' },
    { value: 'grape', label: 'Grape' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'watermelon', label: 'Watermelon' },
    { value: 'kiwi', label: 'Kiwi' },
    { value: 'mango', label: 'Mango' },
    { value: 'pineapple', label: 'Pineapple' },
    { value: 'peach', label: 'Peach' },
  ];

  return (
    <PmsFormFieldsLayout>
      <Form.Field
        control={control}
        name="paymentIds"
        render={({ field }) => (
          <Form.Item className="flex flex-col">
            <Form.Label>Payments</Form.Label>
            <Form.Description>
              Select payments that you want to use
            </Form.Description>
            <Form.Control>
              <MultipleSelector
                hidePlaceholderWhenSelected
                placeholder="Choose payments"
                defaultOptions={options}
                onChange={(values: MultiSelectOption[]) => console.log(values)}
                className="placeholder:text-accent-foreground/70"
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />

      <Heading className="mt-2">Other payments</Heading>
      <Form.Description className="text-sm text-[#71717A]">
        Type is must latin, some default types: golomtCard, khaanCard, TDBCard
        <br />
        Хэрэв тухайн төлбөрт ебаримт хэвлэхгүй бол: "skipEbarimt: true",
        Харилцагч сонгосон үед л харагдах бол: "mustCustomer: true", Хэрэв
        хуваах боломжгүй бол: "notSplit: true" Урьдчилж төлсөн төлбөрөөр
        <br />
        (Татвар тооцсон) бол: "preTax: true
      </Form.Description>

      <Button className="w-fit" onClick={() => append({})}>
        <IconPlus /> Add payments method
      </Button>

      {fields.map((field, index) => (
        <div className="flex gap-6 items-end">
          <div className="w-full grid grid-cols-3 gap-6">
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
            className="h-8 w-8"
            onClick={() => remove(index)}
          >
            <IconTrash />
          </Button>
        </div>
      ))}
      <div className="mb-5"></div>
    </PmsFormFieldsLayout>
  );
};

export default Payments;
