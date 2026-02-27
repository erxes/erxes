import { UseFormReturn, useWatch } from 'react-hook-form';
import { Form, Label, InfoCard } from 'erxes-ui';
import PmsFormFieldsLayout from '../PmsFormFieldsLayout';
import { PmsBranchFormType } from '@/pms/constants/formSchema';
import {
  SelectBoardFormItem,
  SelectPipelineFormItem,
  SelectStageFormItem,
} from './SelectSalesFlow';
import { SelectCategory } from '@/pms/components/pmsFormFields/pipelineConfig/SelectCategory';

const PipelineConfig = ({
  form,
}: {
  form: UseFormReturn<PmsBranchFormType>;
}) => {
  const boardId = useWatch({ control: form.control, name: 'boardId' });
  const pipelineId = useWatch({ control: form.control, name: 'pipelineId' });

  const handleBoardChange = (value: string) => {
    form.setValue('boardId', value, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue('pipelineId', '', {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue('stageId', '', { shouldValidate: true, shouldDirty: true });
  };

  const handlePipelineChange = (value: string) => {
    form.setValue('pipelineId', value, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue('stageId', '', { shouldValidate: true, shouldDirty: true });
  };

  const handleRoomsCategoryChange = (value: unknown) => {
    form.setValue(
      'roomsCategoryIds',
      Array.isArray(value) ? value : value == null ? [] : [value],
    );
  };

  const handleExtrasCategoryChange = (value: unknown) => {
    form.setValue(
      'extrasCategoryIds',
      Array.isArray(value) ? value : value == null ? [] : [value],
    );
  };

  return (
    <PmsFormFieldsLayout>
      <InfoCard title="Stage">
        <InfoCard.Content>
          <div className="grid grid-cols-3 gap-6">
            <Form.Field
              control={form.control}
              name="boardId"
              render={({ field }) => (
                <Form.Item>
                  <Label>BOARD</Label>
                  <Form.Control>
                    <SelectBoardFormItem
                      value={field.value}
                      onValueChange={handleBoardChange}
                      placeholder="Choose a board"
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="pipelineId"
              render={({ field }) => (
                <Form.Item>
                  <Label>PIPELINE</Label>
                  <Form.Control>
                    <SelectPipelineFormItem
                      value={field.value}
                      boardId={boardId || ''}
                      onValueChange={handlePipelineChange}
                      placeholder="Choose a pipeline"
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="stageId"
              render={({ field }) => (
                <Form.Item>
                  <Label>STAGE</Label>
                  <Form.Control>
                    <SelectStageFormItem
                      value={field.value}
                      pipelineId={pipelineId || ''}
                      onValueChange={field.onChange}
                      placeholder="Choose a stage"
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />
          </div>
        </InfoCard.Content>
      </InfoCard>

      <InfoCard title="Room categories">
        <InfoCard.Content>
          <Form.Field
            control={form.control}
            name="roomsCategoryIds"
            render={({ field }) => (
              <Form.Item>
                <Label>ROOM CATEGORIES</Label>
                <Form.Control>
                  <SelectCategory
                    mode="multiple"
                    value={field.value}
                    onValueChange={handleRoomsCategoryChange}
                  />
                </Form.Control>
                <Form.Message className="text-destructive" />
              </Form.Item>
            )}
          />
        </InfoCard.Content>
      </InfoCard>

      <InfoCard title="Extra product categories">
        <InfoCard.Content>
          <Form.Field
            control={form.control}
            name="extrasCategoryIds"
            render={({ field }) => (
              <Form.Item>
                <Label>EXTRA PRODUCT CATEGORIES</Label>
                <Form.Control>
                  <SelectCategory
                    mode="multiple"
                    value={field.value}
                    onValueChange={handleExtrasCategoryChange}
                  />
                </Form.Control>
                <Form.Message className="text-destructive" />
              </Form.Item>
            )}
          />
        </InfoCard.Content>
      </InfoCard>
    </PmsFormFieldsLayout>
  );
};

export default PipelineConfig;
