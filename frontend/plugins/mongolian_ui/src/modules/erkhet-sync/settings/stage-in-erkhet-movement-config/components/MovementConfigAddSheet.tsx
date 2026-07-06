import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Input, Select, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { addStageInMovementErkhetConfigSchema } from '../constants/addStageInErkhetMovementConfigSchema';
import { IMovementDetail, TMovementErkhetConfig } from '../types';
import { MovementDetailRows } from './MovementDetailRows';

const defaultValues: TMovementErkhetConfig = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  userEmail: '',
  responseField: '',
  defaultCustomer: '',
  details: [],
};

const RESPONSE_FIELD_OPTIONS = [
  { label: 'erkhet-response', value: 'propertiesData.erkhetResponse' },
];

interface Props {
  onSubmit: (data: TMovementErkhetConfig) => Promise<void>;
  loading: boolean;
}

export const MovementConfigAddSheet = ({ onSubmit, loading }: Props) => {
  const { t } = useTranslation('mongolian');
  const [open, setOpen] = useState(false);

  const form = useForm<TMovementErkhetConfig>({
    resolver: zodResolver(addStageInMovementErkhetConfigSchema),
    defaultValues,
  });

  const selectedBoardId = form.watch('boardId');
  const selectedPipelineId = form.watch('pipelineId');

  const handleSubmit = async (data: TMovementErkhetConfig) => {
    await onSubmit(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('new-config', 'New Config')}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-4xl">
        <Sheet.Header>
          <Sheet.Title>{t('new-erkhet-move-config', 'New Erkhet Move Config')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex flex-col overflow-hidden p-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    name="title"
                    control={form.control}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('title', 'Title')}</Form.Label>
                        <Form.Control>
                          <Input {...field} placeholder={t('title', 'Title')} />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="boardId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('board', 'Board')}</Form.Label>
                        <SelectBoard
                          mode="single"
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value as string);
                            form.setValue('pipelineId', '');
                            form.setValue('stageId', '');
                          }}
                          placeholder={t('select-board', 'Select board')}
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    name="userEmail"
                    control={form.control}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('user-email', 'User Email')}</Form.Label>
                        <Form.Control>
                          <Input {...field} placeholder={t('user-email', 'User Email')} />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="pipelineId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('pipeline', 'Pipeline')}</Form.Label>
                        <SelectPipeline
                          mode="single"
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value as string);
                            form.setValue('stageId', '');
                          }}
                          boardId={selectedBoardId || undefined}
                          placeholder={t('select-pipeline', 'Select pipeline')}
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="defaultCustomer"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('default-customer', 'Default Customer')}</Form.Label>
                        <Form.Control>
                          <Input {...field} placeholder={t('default-customer', 'Default Customer')} />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="stageId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('stage', 'Stage')}</Form.Label>
                        <SelectStage
                          mode="single"
                          value={field.value}
                          onValueChange={(value) =>
                            field.onChange(value as string)
                          }
                          pipelineId={selectedPipelineId || undefined}
                          placeholder={t('select-stage', 'Select stage')}
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
                <Form.Field
                  control={form.control}
                  name="responseField"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('response-field', 'Response Field')}</Form.Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value placeholder={t('response-field', 'Response Field')} />
                        </Select.Trigger>
                        <Select.Content>
                          {RESPONSE_FIELD_OPTIONS.map((type) => (
                            <Select.Item key={type.value} value={type.value}>
                              {t(type.label)}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <MovementDetailRows
                  details={(form.watch('details') as IMovementDetail[]) ?? []}
                  onChange={(d) => form.setValue('details', d)}
                />
              </div>
              <div className="flex justify-end gap-2 p-5 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  {t('cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('saving', 'Saving...') : t('save', 'Save')}
                </Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
