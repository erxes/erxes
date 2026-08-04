import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Input, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { addPipelineRemainderConfigSchema } from '../constants/addPipelineRemainderConfigSchema';
import { AddPipelineRemainderConfig } from '../types';
import { PipelineSelectorFields } from '../../shared/components/PipelineSelectorFields';

const defaultValues: AddPipelineRemainderConfig = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  account: '',
  location: '',
};

interface Props {
  onSubmit: (data: AddPipelineRemainderConfig) => Promise<void>;
  loading: boolean;
}

export const PipelineRemainderConfigAddSheet = ({ onSubmit, loading }: Props) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('mongolian');

  const form = useForm<AddPipelineRemainderConfig>({
    resolver: zodResolver(addPipelineRemainderConfigSchema),
    defaultValues,
  });

  const handleSubmit = async (data: AddPipelineRemainderConfig) => {
    await onSubmit(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('new-config')}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>{t('new-pipeline-remainder-config')}</Sheet.Title>
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
                  <div className="flex flex-col gap-4">
                    <Form.Field
                      name="title"
                      control={form.control}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('title')}</Form.Label>
                          <Form.Control>
                            <Input {...field} placeholder={t('title')} />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    <Form.Field
                      name="account"
                      control={form.control}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('account')}</Form.Label>
                          <Form.Control>
                            <Input {...field} placeholder={t('account')} />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    <Form.Field
                      name="location"
                      control={form.control}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('location')}</Form.Label>
                          <Form.Control>
                            <Input {...field} placeholder={t('location')} />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <PipelineSelectorFields form={form} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-5 border-t">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('saving') : t('save')}
                </Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
