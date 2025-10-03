import { Control } from 'react-hook-form';
import { Button, Form, MultipleSelector, MultiSelectOption } from 'erxes-ui';
import PmsFormFieldsLayout from '../PmsFormFieldsLayout';
import Heading from '../../ui/heading';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { PmsBranchFormType } from '@/pms/constants/formSchema';

const Admins = ({ control }: { control: Control<PmsBranchFormType> }) => {
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
      <Heading>Admins</Heading>
      <Form.Field
        control={control}
        name="generalManagerIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>General Managers</Form.Label>
            <Form.Control>
              <MultipleSelector
                hidePlaceholderWhenSelected
                placeholder="Choose team member"
                defaultOptions={options}
                onChange={(values: MultiSelectOption[]) => console.log(values)}
                className="placeholder:text-accent-foreground/70"
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="managerIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Managers</Form.Label>
            <Form.Control>
              <MultipleSelector
                hidePlaceholderWhenSelected
                placeholder="Choose team member"
                defaultOptions={options}
                onChange={(values: MultiSelectOption[]) => console.log(values)}
                className="placeholder:text-accent-foreground/70"
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="reservationManagerIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Reservation Managers</Form.Label>
            <Form.Control>
              <MultipleSelector
                hidePlaceholderWhenSelected
                placeholder="Choose team member"
                defaultOptions={options}
                onChange={(values: MultiSelectOption[]) => console.log(values)}
                className="placeholder:text-accent-foreground/70"
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="receptionIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Reception</Form.Label>
            <Form.Control>
              <MultipleSelector
                hidePlaceholderWhenSelected
                placeholder="Choose team member"
                defaultOptions={options}
                onChange={(values: MultiSelectOption[]) => console.log(values)}
                className="placeholder:text-accent-foreground/70"
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="housekeeperIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Housekeeper</Form.Label>
            <Form.Control>
              <MultipleSelector
                hidePlaceholderWhenSelected
                placeholder="Choose team member"
                defaultOptions={options}
                onChange={(values: MultiSelectOption[]) => console.log(values)}
                className="placeholder:text-accent-foreground/70"
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
      <Button className="w-fit">
        <IconPlus /> Add team member
      </Button>
    </PmsFormFieldsLayout>
  );
};

export default Admins;
