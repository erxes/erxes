import { Form, Select } from 'erxes-ui';
import { SelectMember, SelectProduct } from 'ui-modules';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { useFieldsCombined } from '../../hooks/useFieldsCombined';
import { SelectPipelineFormItem } from '../../hooks/useSelectPipeline';
import { SelectBoardFormItem } from '../../hooks/useSelectBoard';
import { SelectStageFormItem } from '../../hooks/useSelectStage';
import {
  deliveryConfigSchema,
  type DeliveryConfigFormValues,
} from '../formSchema';
import { IPosDetail } from '@/pos/pos-detail/types/IPos';

interface DeliveryConfigFormProps {
  form?: UseFormReturn<DeliveryConfigFormValues>;
  onFormSubmit?: (data: DeliveryConfigFormValues) => void;
  posDetail?: IPosDetail;
}

export interface DeliveryConfigFormRef {
  submit: () => Promise<void>;
  getFormData: () => DeliveryConfigFormValues;
}

const DeliveryConfigForm = forwardRef<
  DeliveryConfigFormRef,
  DeliveryConfigFormProps
>(({ form: externalForm, onFormSubmit, posDetail }, ref) => {
  const [selectedWatchedUserIds, setSelectedWatchedUserIds] = useState<
    string[]
  >([]);
  const [selectedAssignedUserIds, setSelectedAssignedUserIds] = useState<
    string[]
  >([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');

  const { fields: fetchedFields, loading: fieldsLoading } = useFieldsCombined({
    contentType: 'sales:deal',
  });

  // Static fallback data
  const staticFields = [
    {
      _id: '0.727854523642331',
      name: 'parentId',
      label: 'Parent Id',
      type: 'String',
    },
    {
      _id: '0.41186703735829466',
      name: 'createdAt',
      label: 'Created at',
      type: 'Date',
    },
    {
      _id: '0.18766163437667394',
      name: 'name',
      label: 'Name',
      type: 'String',
    },
  ];

  const fields =
    fetchedFields && fetchedFields.length > 0 ? fetchedFields : staticFields;

  const internalForm = useForm<DeliveryConfigFormValues>({
    resolver: zodResolver(deliveryConfigSchema),
    defaultValues: {
      boardId: '',
      pipeline: '',
      stage: '',
      mapField: '',
      watchedUsers: '',
      assignedUsers: '',
      deliveryProduct: '',
      watchedUserIds: [],
      assignedUserIds: [],
    },
  });

  const form = externalForm || internalForm;

  useEffect(() => {
    if (posDetail?.deliveryConfig) {
      const deliveryConfig = posDetail.deliveryConfig;
      const watchedUserIds =
        deliveryConfig.watchedUserIds ||
        deliveryConfig.users?.watched ||
        (deliveryConfig.watchedUsers ? [deliveryConfig.watchedUsers] : []) ||
        [];

      const assignedUserIds =
        deliveryConfig.assignedUserIds ||
        deliveryConfig.users?.assigned ||
        (deliveryConfig.assignedUsers ? [deliveryConfig.assignedUsers] : []) ||
        [];

      const boardId =
        deliveryConfig.boardId ||
        deliveryConfig.stage?.board ||
        deliveryConfig.board ||
        '';
      const pipelineId =
        deliveryConfig.pipeline || deliveryConfig.stage?.pipeline || '';

      setSelectedWatchedUserIds(watchedUserIds);
      setSelectedAssignedUserIds(assignedUserIds);
      setSelectedPipelineId(pipelineId);
      setSelectedBoardId(boardId);

      form.reset({
        boardId,
        pipeline: pipelineId,
        stage: deliveryConfig.stage || deliveryConfig.stage?.stage || '',
        mapField: deliveryConfig.mapField || '',
        watchedUsers: watchedUserIds[0] || '',
        assignedUsers: assignedUserIds[0] || '',
        deliveryProduct:
          deliveryConfig.product?.deliveryProduct ||
          deliveryConfig.deliveryProduct ||
          '',
        watchedUserIds: watchedUserIds,
        assignedUserIds: assignedUserIds,
      });
    }
  }, [posDetail, form]);

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      console.error('Form validation failed');
      return;
    }

    const formData = form.getValues();
    const transformedData = {
      ...formData,
      watchedUserIds: selectedWatchedUserIds,
      assignedUserIds: selectedAssignedUserIds,
      deliveryConfig: {
        stage: {
          board: formData.boardId || '',
          pipeline: formData.pipeline || '',
          stage: formData.stage || '',
        },
        users: {
          watched: selectedWatchedUserIds,
          assigned: selectedAssignedUserIds,
        },
        product: {
          deliveryProduct: formData.deliveryProduct || '',
        },
        ...(formData.mapField && { mapField: formData.mapField }),
      },
    };

    if (onFormSubmit) {
      onFormSubmit(transformedData);
    }
  };

  const getFormData = () => {
    const formData = form.getValues();
    return {
      ...formData,
      watchedUserIds: selectedWatchedUserIds,
      assignedUserIds: selectedAssignedUserIds,
    };
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    getFormData,
  }));

  const handleWatchedUserChange = (value: string | string[] | null) => {
    const userIds = Array.isArray(value) ? value : value ? [value] : [];

    setSelectedWatchedUserIds(userIds);
    form.setValue('watchedUserIds', userIds, { shouldValidate: true });
    form.setValue('watchedUsers', userIds[0] || '', { shouldValidate: true });
  };

  const handleAssignedUserChange = (value: string | string[] | null) => {
    const userIds = Array.isArray(value) ? value : value ? [value] : [];

    setSelectedAssignedUserIds(userIds);
    form.setValue('assignedUserIds', userIds, { shouldValidate: true });
    form.setValue('assignedUsers', userIds[0] || '', { shouldValidate: true });
  };

  const handleDeliveryProductChange = (value: string | string[]) => {
    const productId = Array.isArray(value) ? value[0] : value;
    form.setValue('deliveryProduct', productId, { shouldValidate: true });
  };

  const handleBoardChange = (value: string | string[]) => {
    const boardId = Array.isArray(value) ? value[0] : value;
    setSelectedBoardId(boardId);
    form.setValue('boardId', boardId, { shouldValidate: true });
    form.setValue('pipeline', '', { shouldValidate: true });
    form.setValue('stage', '', { shouldValidate: true });
    setSelectedPipelineId('');
  };

  const handlePipelineChange = (value: string | string[]) => {
    const pipelineId = Array.isArray(value) ? value[0] : value;
    setSelectedPipelineId(pipelineId);
    form.setValue('pipeline', pipelineId, { shouldValidate: true });
    form.setValue('stage', '', { shouldValidate: true });
  };

  return (
    <div className="p-3">
      <Form {...form}>
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-primary">STAGE</h2>

            <div className="grid grid-cols-3 gap-4">
              <Form.Field
                control={form.control}
                name="boardId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-sm">BOARD</Form.Label>
                    <SelectBoardFormItem
                      value={field.value}
                      onValueChange={handleBoardChange}
                      placeholder="Choose board"
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="pipeline"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-sm">PIPELINE</Form.Label>
                    <SelectPipelineFormItem
                      key={selectedBoardId}
                      value={field.value}
                      onValueChange={handlePipelineChange}
                      boardId={selectedBoardId}
                      placeholder="Choose pipeline"
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-sm">STAGE</Form.Label>
                    <SelectStageFormItem
                      key={selectedPipelineId}
                      value={field.value}
                      onValueChange={field.onChange}
                      pipelineId={selectedPipelineId}
                      placeholder="Choose stage"
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>

            <div className="space-y-2">
              <Form.Field
                control={form.control}
                name="mapField"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-sm">
                      CHOOSE MAP FIELD
                    </Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={fieldsLoading}
                      >
                        <Select.Trigger>
                          <Select.Value
                            placeholder={
                              fieldsLoading
                                ? 'Loading fields...'
                                : 'Select map field'
                            }
                          />
                        </Select.Trigger>
                        <Select.Content>
                          {fields.map((fieldItem) => (
                            <Select.Item
                              key={fieldItem.name}
                              value={fieldItem.name}
                            >
                              {fieldItem.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-primary">DEAL USER</h2>
            </div>

            <div className="space-y-4">
              <Form.Field
                control={form.control}
                name="watchedUserIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-sm">WATCHED USERS</Form.Label>
                    <Form.Control>
                      <SelectMember
                        mode="multiple"
                        value={selectedWatchedUserIds}
                        onValueChange={handleWatchedUserChange}
                        className="justify-start w-full h-8"
                        placeholder="Select watched team members"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="assignedUserIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-sm">ASSIGNED USERS</Form.Label>

                    <Form.Control>
                      <SelectMember
                        mode="multiple"
                        value={selectedAssignedUserIds}
                        onValueChange={handleAssignedUserChange}
                        className="justify-start w-full h-8"
                        placeholder="Select assigned team members"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-primary">
              DELIVERY PRODUCT
            </h2>

            <Form.Field
              control={form.control}
              name="deliveryProduct"
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <SelectProduct
                      value={field.value}
                      onValueChange={handleDeliveryProductChange}
                      className="justify-start w-full h-8"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </div>
      </Form>
    </div>
  );
});

DeliveryConfigForm.displayName = 'DeliveryConfigForm';

export default DeliveryConfigForm;
