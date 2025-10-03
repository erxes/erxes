import { Control } from 'react-hook-form';
import {
  Button,
  Form,
  MultipleSelector,
  MultiSelectOption,
  Select,
} from 'erxes-ui';
import PmsFormFieldsLayout from '../PmsFormFieldsLayout';
import { IconPlus } from '@tabler/icons-react';
import { PmsBranchFormType } from '@/pms/constants/formSchema';
import Heading from '../../ui/heading';

const PipelineConfig = ({
  control,
}: {
  control: Control<PmsBranchFormType>;
}) => {
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
      <Heading>Stage</Heading>
      <div className="grid grid-cols-3 gap-6">
        <Form.Field
          control={control}
          name="boardId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Board</Form.Label>
              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder="Choose board" />
                  </Select.Trigger>
                  <Select.Content className="max-h-52">
                    {['board1', 'board2', 'board3'].map((test, index) => (
                      <Select.Item value={test} key={index}>
                        {test}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Control>
              <Form.Message className="text-destructive" />
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="pipelineId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Pipeline</Form.Label>
              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder="Choose pipeline" />
                  </Select.Trigger>
                  <Select.Content className="max-h-52">
                    {['pipeline1', 'pipeline2', 'pipeline3'].map(
                      (test, index) => (
                        <Select.Item value={test} key={index}>
                          {test}
                        </Select.Item>
                      ),
                    )}
                  </Select.Content>
                </Select>
              </Form.Control>
              <Form.Message className="text-destructive" />
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="stageId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Stage</Form.Label>
              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder="Choose stage" />
                  </Select.Trigger>
                  <Select.Content className="max-h-52">
                    {['stage1', 'stage2', 'stage3'].map((test, index) => (
                      <Select.Item value={test} key={index}>
                        {test}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Control>
              <Form.Message className="text-destructive" />
            </Form.Item>
          )}
        />
      </div>

      <Heading>Room category</Heading>
      <Form.Field
        control={control}
        name="roomsCategoryId"
        render={({ field }) => (
          <Form.Item>
            <Form.Control>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value placeholder="Choose room category" />
                </Select.Trigger>
                <Select.Content className="max-h-52">
                  {['roomCategory1', 'roomCategory2', 'roomCategory3'].map(
                    (test, index) => (
                      <Select.Item value={test} key={index}>
                        {test}
                      </Select.Item>
                    ),
                  )}
                </Select.Content>
              </Select>
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
      <Button className="w-fit">
        <IconPlus /> Add room
      </Button>

      <Heading>Extra product categories</Heading>
      <Form.Field
        control={control}
        name="extrasCategoryId"
        render={({ field }) => (
          <Form.Item>
            <Form.Control>
              <MultipleSelector
                hidePlaceholderWhenSelected
                placeholder="Choose product categories"
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
        <IconPlus /> Add extra product
      </Button>
    </PmsFormFieldsLayout>
  );
};

export default PipelineConfig;
