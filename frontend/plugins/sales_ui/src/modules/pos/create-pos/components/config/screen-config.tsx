import { Form, Input, Select, Switch } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { IPosDetail, IScreenConfig } from '@/pos/pos-detail/types/IPos';
import {
  KITCHEN_TYPE_OPTIONS,
  SHOW_TYPE_OPTIONS,
  WAITING_TYPE_OPTIONS,
} from '@/pos/constants';
import {
  KitchenScreenConfigFormValues,
  WaitingScreenConfigFormValues,
} from '../formSchema';

interface ScreenConfigFormProps {
  posDetail?: IPosDetail;
  isReadOnly?: boolean;
  onSubmit?: (data: {
    kitchenScreen: IScreenConfig;
    waitingScreen: IScreenConfig;
  }) => Promise<void>;
  form?: {
    kitchenScreen?: UseFormReturn<KitchenScreenConfigFormValues>;
    waitingScreen?: UseFormReturn<WaitingScreenConfigFormValues>;
  };
  onDataChange?: (data: {
    kitchenScreen: IScreenConfig;
    waitingScreen: IScreenConfig;
  }) => void;
}

interface ScreenConfigFormData {
  // Kitchen Screen
  kitchenScreenEnabled: boolean;
  kitchenShowTypes: string;
  kitchenStatusChange: string;
  kitchenPrintEnabled: boolean;
  kitchenValue: string;

  // Waiting Screen
  waitingScreenEnabled: boolean;
  waitingChangeType: string;
  waitingChangeCount: string;
  waitingContentUrl: string;
}

const transformToScreenConfig = (data: Partial<ScreenConfigFormData>) => {
  const kitchenScreen: IScreenConfig = {
    isActive: data.kitchenScreenEnabled || false,
    type: data.kitchenStatusChange || '',
    showType: data.kitchenShowTypes || '',
    isPrint: data.kitchenPrintEnabled || false,
    value: parseInt(data.kitchenValue || '0') || 0,
  };

  const waitingScreen: IScreenConfig = {
    isActive: data.waitingScreenEnabled || false,
    type: data.waitingChangeType || '',
    value: parseInt(data.waitingChangeCount || '0') || 0,
    contentUrl: data.waitingContentUrl || '',
  };

  return { kitchenScreen, waitingScreen };
};

export default function ScreenConfigForm({
  posDetail,
  isReadOnly = false,
  onSubmit,
  form: externalForms,
  onDataChange,
}: ScreenConfigFormProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, setIsSubmitting] = useState(false);

  const form = useForm<ScreenConfigFormData>({
    defaultValues: {
      // Kitchen Screen
      kitchenScreenEnabled: false,
      kitchenShowTypes: '',
      kitchenStatusChange: '',
      kitchenPrintEnabled: false,
      kitchenValue: '0',

      // Waiting Screen
      waitingScreenEnabled: false,
      waitingChangeType: '',
      waitingChangeCount: '0',
      waitingContentUrl: '',
    },
  });

  const watchKitchenScreenEnabled = form.watch('kitchenScreenEnabled');
  const watchKitchenStatusChange = form.watch('kitchenStatusChange');
  const watchWaitingScreenEnabled = form.watch('waitingScreenEnabled');
  const watchWaitingChangeType = form.watch('waitingChangeType');

  useEffect(() => {
    if (posDetail) {
      const resetData = {
        // Kitchen Screen
        kitchenScreenEnabled: posDetail.kitchenScreen?.isActive ?? false,
        kitchenShowTypes: posDetail.kitchenScreen?.showType || '',
        kitchenStatusChange: posDetail.kitchenScreen?.type || '',
        kitchenPrintEnabled: posDetail.kitchenScreen?.isPrint ?? false,
        kitchenValue: posDetail.kitchenScreen?.value?.toString() || '',

        // Waiting Screen
        waitingScreenEnabled: posDetail.waitingScreen?.isActive ?? false,
        waitingChangeType: posDetail.waitingScreen?.type || '',
        waitingChangeCount: posDetail.waitingScreen?.value?.toString() || '',
        waitingContentUrl: posDetail.waitingScreen?.contentUrl || '',
      };
      form.reset(resetData);

      if (onDataChange) {
        const { kitchenScreen, waitingScreen } =
          transformToScreenConfig(resetData);
        onDataChange({ kitchenScreen, waitingScreen });
      }
    } else {
      const resetData = {
        // Kitchen Screen
        kitchenScreenEnabled: false,
        kitchenShowTypes: '',
        kitchenStatusChange: '',
        kitchenPrintEnabled: false,
        kitchenValue: '0',

        // Waiting Screen
        waitingScreenEnabled: false,
        waitingChangeType: '',
        waitingChangeCount: '0',
        waitingContentUrl: '',
      };
      form.reset(resetData);

      if (onDataChange) {
        const { kitchenScreen, waitingScreen } =
          transformToScreenConfig(resetData);
        onDataChange({ kitchenScreen, waitingScreen });
      }
    }
  }, [posDetail, form, onDataChange]);

  useEffect(() => {
    const subscription = form.watch((data) => {
      const { kitchenScreen, waitingScreen } = transformToScreenConfig(data);

      if (externalForms?.kitchenScreen) {
        externalForms.kitchenScreen.setValue(
          'isActive',
          kitchenScreen.isActive,
        );
        externalForms.kitchenScreen.setValue('type', kitchenScreen.type);
        externalForms.kitchenScreen.setValue(
          'showType',
          kitchenScreen.showType || '',
        );
        externalForms.kitchenScreen.setValue(
          'isPrint',
          kitchenScreen.isPrint || false,
        );
        externalForms.kitchenScreen.setValue('value', kitchenScreen.value);
      }

      if (externalForms?.waitingScreen) {
        externalForms.waitingScreen.setValue(
          'isActive',
          waitingScreen.isActive,
        );
        externalForms.waitingScreen.setValue('type', waitingScreen.type);
        externalForms.waitingScreen.setValue('value', waitingScreen.value || 0);
        externalForms.waitingScreen.setValue(
          'contentUrl',
          waitingScreen.contentUrl || '',
        );
      }

      if (onDataChange) {
        onDataChange({ kitchenScreen, waitingScreen });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, externalForms, onDataChange]);

  const handleSubmit = async (data: ScreenConfigFormData) => {
    if (onSubmit) {
      try {
        setIsSubmitting(true);
        const { kitchenScreen, waitingScreen } = transformToScreenConfig(data);

        await onSubmit({ kitchenScreen, waitingScreen });
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
            <h2 className="text-xl font-medium uppercase text-primary">MAIN</h2>

            <div className="space-y-3">
              <Form.Field
                control={form.control}
                name="kitchenScreenEnabled"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex flex-col gap-3">
                      <Form.Label className="text-xs font-semibold">
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
                <div className="grid grid-cols-3 gap-4 mt-4 duration-200 animate-in slide-in-from-top-2">
                  <Form.Field
                    control={form.control}
                    name="kitchenShowTypes"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label className="text-xs font-semibold">
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
                    name="kitchenStatusChange"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label className="text-xs font-semibold">
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

                  {watchKitchenStatusChange === 'time' && (
                    <Form.Field
                      control={form.control}
                      name="kitchenValue"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label className="text-xs font-semibold uppercase">
                            Time (minute)
                          </Form.Label>
                          <Form.Control>
                            <Input
                              type="number"
                              {...field}
                              placeholder="Enter value"
                              disabled={isReadOnly}
                              readOnly={isReadOnly}
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Form.Field
                control={form.control}
                name="waitingScreenEnabled"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex flex-col gap-3">
                      <Form.Label className="text-xs font-semibold">
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

              {watchWaitingScreenEnabled && (
                <div className="grid grid-cols-2 gap-4 mt-4 duration-200 animate-in slide-in-from-top-2">
                  <Form.Field
                    control={form.control}
                    name="waitingChangeType"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label className="text-xs font-semibold">
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
                    name="waitingChangeCount"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label className="text-xs font-semibold">
                          {watchWaitingChangeType === 'time'
                            ? 'CHANGE TIME (MINUTE)'
                            : 'CHANGE COUNT'}
                        </Form.Label>
                        <Form.Control>
                          <Input
                            type="number"
                            {...field}
                            placeholder={
                              watchWaitingChangeType === 'time'
                                ? 'Enter time (minute)'
                                : 'Enter count'
                            }
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
                    name="waitingContentUrl"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label className="text-xs font-semibold">
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
                name="kitchenPrintEnabled"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex flex-col gap-3">
                      <Form.Label className="text-xs font-semibold">
                        PRINT
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
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
