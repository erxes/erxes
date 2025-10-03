import { Button, Form, Input, Select, Switch } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IPosDetail, IScreenConfig } from '@/pos-detail/types/IPos';
import {
  KITCHEN_TYPE_OPTIONS,
  SHOW_TYPE_OPTIONS,
  WAITING_TYPE_OPTIONS,
} from '@/constants';

interface ScreenConfigFormProps {
  posDetail?: IPosDetail;
  isReadOnly?: boolean;
  onSubmit?: (data: IScreenConfig) => Promise<void>;
}

interface ScreenConfigFormData {
  kitchenScreenEnabled: boolean;
  showTypes: string;
  statusChange: string;
  watchingScreenEnabled: boolean;
  changeType: string;
  changeCount: string;
  contentUrl: string;
  printEnabled: boolean;
}

export default function ScreenConfigForm({
  posDetail,
  isReadOnly = false,
  onSubmit,
}: ScreenConfigFormProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ScreenConfigFormData>({
    defaultValues: {
      kitchenScreenEnabled: false,
      showTypes: '',
      statusChange: '',
      watchingScreenEnabled: false,
      changeType: '',
      changeCount: '',
      contentUrl: '',
      printEnabled: false,
    },
  });

  const watchKitchenScreenEnabled = form.watch('kitchenScreenEnabled');
  const watchWatchingScreenEnabled = form.watch('watchingScreenEnabled');

  useEffect(() => {
    if (posDetail) {
      form.reset({
        kitchenScreenEnabled: posDetail.kitchenScreen?.isActive ?? false,
        showTypes: posDetail.kitchenScreen?.showType || '',
        statusChange: posDetail.kitchenScreen?.type || '',
        watchingScreenEnabled: posDetail.waitingScreen?.isActive ?? false,
        changeType: posDetail.waitingScreen?.type || '',
        changeCount: posDetail.waitingScreen?.value?.toString() || '',
        contentUrl: posDetail.waitingScreen?.contentUrl || '',
        printEnabled: posDetail.kitchenScreen?.isPrint ?? false,
      });
    } else {
      form.reset({
        kitchenScreenEnabled: false,
        showTypes: '',
        statusChange: '',
        watchingScreenEnabled: false,
        changeType: '',
        changeCount: '',
        contentUrl: '',
        printEnabled: false,
      });
    }
  }, [posDetail, form]);

  const handleSubmit = async (data: ScreenConfigFormData) => {
    if (onSubmit) {
      try {
        setIsSubmitting(true);
        const transformedConfig: IScreenConfig = {
          isActive: data.kitchenScreenEnabled,
          type: data.statusChange,
          value: parseInt(data.changeCount) || 0,
          contentUrl: data.contentUrl,
          showType: data.showTypes,
          isPrint: data.printEnabled,
        };
        await onSubmit(transformedConfig);
      } catch (error) {
        console.error('Screen config form submission failed:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', 'ebarimt');
      setSearchParams(newParams);
    }
  };

  return (
    <div className="p-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-[#4F46E5] text-base font-semibold">MAIN</h2>

            <div className="space-y-2">
              <Form.Field
                control={form.control}
                name="kitchenScreenEnabled"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex flex-col gap-3">
                      <Form.Label className="text-gray-600 text-sm">
                        KITCHEN SCREEN
                      </Form.Label>
                      <Form.Control>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </Form.Control>
                    </div>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              {watchKitchenScreenEnabled && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Form.Field
                    control={form.control}
                    name="showTypes"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label className="text-sm text-gray-500">
                          SHOW TYPES
                        </Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isReadOnly}
                          >
                            <Select.Trigger>
                              <Select.Value placeholder="Select show type" />
                            </Select.Trigger>
                            <Select.Content>
                              {SHOW_TYPE_OPTIONS.map((option) => (
                                <Select.Item
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="statusChange"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label className="text-sm text-gray-500">
                          STATUS CHANGE/LEAVE/
                        </Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isReadOnly}
                          >
                            <Select.Trigger>
                              <Select.Value placeholder="Select status change type" />
                            </Select.Trigger>
                            <Select.Content>
                              {KITCHEN_TYPE_OPTIONS.map((option) => (
                                <Select.Item
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
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
              )}
            </div>

            <div className="space-y-2">
              <Form.Field
                control={form.control}
                name="watchingScreenEnabled"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex flex-col gap-3">
                      <Form.Label className="text-gray-600">
                        WATCHING SCREEN
                      </Form.Label>
                      <Form.Control>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </Form.Control>
                    </div>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              {watchWatchingScreenEnabled && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in slide-in-from-top-2 duration-200">
                  <Form.Field
                    control={form.control}
                    name="changeType"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label className="text-sm text-gray-500">
                          CHANGE TYPE
                        </Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isReadOnly}
                          >
                            <Select.Trigger>
                              <Select.Value placeholder="Select change type" />
                            </Select.Trigger>
                            <Select.Content>
                              {WAITING_TYPE_OPTIONS.map((option) => (
                                <Select.Item
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="changeCount"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label className="text-sm text-gray-500">
                          CHANGE COUNT
                        </Form.Label>
                        <Form.Control>
                          <Input
                            type="number"
                            {...field}
                            placeholder="Enter count"
                            disabled={isReadOnly}
                            readOnly={isReadOnly}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="contentUrl"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label className="text-sm text-gray-500">
                          CONTENT URL
                        </Form.Label>
                        <Form.Control>
                          <Input
                            type="url"
                            {...field}
                            placeholder="Enter URL"
                            disabled={isReadOnly}
                            readOnly={isReadOnly}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Form.Field
                control={form.control}
                name="printEnabled"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex flex-col gap-3">
                      <Form.Label className="text-gray-600">PRINT</Form.Label>
                      <Form.Control>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </Form.Control>
                    </div>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </div>

          {!isReadOnly && onSubmit && (
            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="default"
                size="default"
              >
                {isSubmitting ? 'Saving...' : posDetail ? 'Update' : 'Save'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
