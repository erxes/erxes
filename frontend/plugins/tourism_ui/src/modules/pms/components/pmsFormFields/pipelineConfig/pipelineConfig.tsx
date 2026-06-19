import { UseFormReturn, useWatch } from 'react-hook-form';
import { Form, Label, InfoCard, Switch } from 'erxes-ui';
import PmsFormFieldsLayout from '../PmsFormFieldsLayout';
import { PmsBranchFormType } from '@/pms/constants/formSchema';
import { SelectBoardFormItem, SelectPipelineFormItem } from './SelectSalesFlow';
import { SelectCategory } from '@/pms/components/pmsFormFields/pipelineConfig/SelectCategory';
import { SelectProducts } from './SelectProducts';

const PipelineConfig = ({
  form,
}: {
  form: UseFormReturn<PmsBranchFormType>;
}) => {
  const boardId = useWatch({ control: form.control, name: 'boardId' });
  const roomsCategoryIds = useWatch({
    control: form.control,
    name: 'roomsCategoryIds',
  });
  const extrasCategoryIds = useWatch({
    control: form.control,
    name: 'extrasCategoryIds',
  });
  const appointmentCategoryIds = useWatch({
    control: form.control,
    name: 'appointmentCategoryIds',
  });

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

  const handleExcludeRoomCategoryChange = (value: unknown) => {
    form.setValue(
      'excludeRoomCategoryIds',
      Array.isArray(value) ? value : value == null ? [] : [value],
    );
  };

  const handleExcludeRoomChange = (value: unknown) => {
    form.setValue(
      'excludeRoomIds',
      Array.isArray(value) ? value : value == null ? [] : [value],
    );
  };

  const handleExcludeExtraProductCategoryChange = (value: unknown) => {
    form.setValue(
      'excludeExtraProductCategoryIds',
      Array.isArray(value) ? value : value == null ? [] : [value],
    );
  };

  const handleExcludeExtraProductChange = (value: unknown) => {
    form.setValue(
      'excludeExtraProductIds',
      Array.isArray(value) ? value : value == null ? [] : [value],
    );
  };

  const handleAppointmentCategoryChange = (value: unknown) => {
    form.setValue(
      'appointmentCategoryIds',
      Array.isArray(value) ? value : value == null ? [] : [value],
    );
  };

  const handleExcludeAppointmentCategoryChange = (value: unknown) => {
    form.setValue(
      'excludeAppointmentCategoryIds',
      Array.isArray(value) ? value : value == null ? [] : [value],
    );
  };

  const handleExcludeAppointmentChange = (value: unknown) => {
    form.setValue(
      'excludeAppointmentIds',
      Array.isArray(value) ? value : value == null ? [] : [value],
    );
  };

  const handleAppointmentToggle = (checked: boolean) => {
    form.setValue('hasAppointment', checked, {
      shouldDirty: true,
    });
  };

  return (
    <PmsFormFieldsLayout>
      <InfoCard title="Stage">
        <InfoCard.Content>
          <div className="grid grid-cols-2 gap-6">
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

          <div className="grid grid-cols-2 gap-6">
            <Form.Field
              control={form.control}
              name="excludeRoomCategoryIds"
              render={({ field }) => (
                <Form.Item>
                  <Label>EXCLUDE ROOM CATEGORIES</Label>
                  <Form.Control>
                    <SelectCategory
                      currentCategoryIds={roomsCategoryIds}
                      mode="multiple"
                      value={field.value}
                      onValueChange={handleExcludeRoomCategoryChange}
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="excludeRoomIds"
              render={({ field }) => (
                <Form.Item>
                  <Label>EXCLUDE ROOMS</Label>
                  <Form.Control>
                    <SelectProducts
                      mode="multiple"
                      value={field.value}
                      categories={roomsCategoryIds}
                      onValueChange={handleExcludeRoomChange}
                      placeholder="Select rooms"
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />
          </div>
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

          <div className="grid grid-cols-2 gap-6">
            <Form.Field
              control={form.control}
              name="excludeExtraProductCategoryIds"
              render={({ field }) => (
                <Form.Item>
                  <Label>EXCLUDE EXTRA PRODUCT CATEGORIES</Label>
                  <Form.Control>
                    <SelectCategory
                      currentCategoryIds={extrasCategoryIds}
                      mode="multiple"
                      value={field.value}
                      onValueChange={handleExcludeExtraProductCategoryChange}
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="excludeExtraProductIds"
              render={({ field }) => (
                <Form.Item>
                  <Label>EXCLUDE EXTRA PRODUCTS</Label>
                  <Form.Control>
                    <SelectProducts
                      mode="multiple"
                      value={field.value}
                      categories={extrasCategoryIds}
                      onValueChange={handleExcludeExtraProductChange}
                      placeholder="Select extra products"
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />
          </div>
        </InfoCard.Content>
      </InfoCard>

      <InfoCard title="Appointment product categories">
        <InfoCard.Content>
          <Form.Field
            control={form.control}
            name="hasAppointment"
            render={({ field }) => (
              <div className="flex gap-3 items-center">
                <Switch
                  checked={Boolean(field.value)}
                  onCheckedChange={handleAppointmentToggle}
                  className="w-10 h-6 [&_span]:size-4 [&_span]:data-[state=checked]:translate-x-[19px] rtl:[&_span]:data-[state=checked]:-translate-x-[19px]"
                />
                <Label>ENABLE APPOINTMENTS</Label>
              </div>
            )}
          />

          <Form.Field
            control={form.control}
            name="appointmentCategoryIds"
            render={({ field }) => (
              <Form.Item>
                <Label>APPOINTMENT CATEGORIES</Label>
                <Form.Control>
                  <SelectCategory
                    mode="multiple"
                    value={field.value}
                    onValueChange={handleAppointmentCategoryChange}
                  />
                </Form.Control>
                <Form.Message className="text-destructive" />
              </Form.Item>
            )}
          />

          <div className="grid grid-cols-2 gap-6">
            <Form.Field
              control={form.control}
              name="excludeAppointmentCategoryIds"
              render={({ field }) => (
                <Form.Item>
                  <Label>EXCLUDE APPOINTMENT CATEGORIES</Label>
                  <Form.Control>
                    <SelectCategory
                      currentCategoryIds={appointmentCategoryIds}
                      mode="multiple"
                      value={field.value}
                      onValueChange={handleExcludeAppointmentCategoryChange}
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="excludeAppointmentIds"
              render={({ field }) => (
                <Form.Item>
                  <Label>EXCLUDE APPOINTMENTS</Label>
                  <Form.Control>
                    <SelectProducts
                      mode="multiple"
                      value={field.value}
                      categories={appointmentCategoryIds}
                      onValueChange={handleExcludeAppointmentChange}
                      placeholder="Select appointments"
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />
          </div>
        </InfoCard.Content>
      </InfoCard>
    </PmsFormFieldsLayout>
  );
};

export default PipelineConfig;
