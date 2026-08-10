import { Button, Form, Input } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@apollo/client';
import { SelectPipeline } from './selects/SelectPipeline';
import { SelectStage } from './selects/SelectStage';
import { SelectSalesBoard } from './selects/SelectBoard';
import { addPipelineRemainderConfigSchema } from '../constants/addPipelineRemainderConfigSchema';
import { useCreatePipelineRemainderConfig } from '../hooks/useCreatePipelineRemainderConfig';
import { AddPipelineRemainderConfig } from '../types';
import { GET_CONFIGS_GET_VALUE } from '../graphql/queries/usePipelineRemainderConfigQuery';

const defaultValues = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  account: '',
  location: '',
};

const EditConfigForm = ({ config, onNewConfig, onSubmit, loading }: any) => {
  const { t } = useTranslation('mongolian');
  const form = useForm({
    resolver: zodResolver(addPipelineRemainderConfigSchema),
    defaultValues: {
      title: config?.title || '',
      boardId: config?.boardId || '',
      pipelineId: config?.pipelineId || '',
      stageId: config?.stageId || '',
      account: config?.account || '',
      location: config?.location || '',
    },
  });

  const selectedBoardId = form.watch('boardId');
  const selectedPipelineId = form.watch('pipelineId');

  return (
    <div className="">
      <Form {...form}>
        <form
          className="h-full w-full mx-auto max-w-2xl px-9 py-5 flex flex-col gap-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold">{t('sales-label')}</h1>
            <Button type="button" onClick={onNewConfig}>
              {t('new-config')}
            </Button>
          </div>

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

          <div className="grid grid-cols-1 gap-4">
            <Form.Field
              control={form.control}
              name="boardId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('destination-stage-board')}</Form.Label>
                  <SelectSalesBoard
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('pipelineId', '');
                      form.setValue('stageId', '');
                    }}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="pipelineId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('pipeline')}</Form.Label>
                  <SelectPipeline
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('stageId', '');
                    }}
                    boardId={selectedBoardId}
                    disabled={!selectedBoardId}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="stageId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('stage')}</Form.Label>
                  <SelectStage
                    id="stageId"
                    variant="form"
                    value={field.value}
                    onValueChange={field.onChange}
                    pipelineId={selectedPipelineId}
                    disabled={!selectedPipelineId}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
          <Form.Field
            name="account"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('account')}</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder={t('user-email')} />
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
                  <Input {...field} placeholder={t('return-type')} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

const NewConfigForm = ({
  onCancel,
  onSubmit,
  loading,
}: {
  onCancel: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}) => {
  const { t } = useTranslation('mongolian');
  const form = useForm({
    resolver: zodResolver(addPipelineRemainderConfigSchema),
    defaultValues,
  });

  const selectedBoardId = form.watch('boardId');
  const selectedPipelineId = form.watch('pipelineId');

  return (
    <div className="">
      <Form {...form}>
        <form
          className="w-full mx-auto max-w-2xl flex flex-col gap-6 px-9 py-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <h1 className="text-lg font-semibold">{t('sales-label')}</h1>

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

          <div className="grid grid-cols-1 gap-4">
            <Form.Field
              control={form.control}
              name="boardId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('destination-stage-board')}</Form.Label>
                  <SelectSalesBoard
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('pipelineId', '');
                      form.setValue('stageId', '');
                    }}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="pipelineId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('pipeline')}</Form.Label>
                  <SelectPipeline
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('stageId', '');
                    }}
                    boardId={selectedBoardId}
                    disabled={!selectedBoardId}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="stageId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('stage')}</Form.Label>
                  <SelectStage
                    id="stageId"
                    variant="form"
                    value={field.value}
                    onValueChange={field.onChange}
                    pipelineId={selectedPipelineId}
                    disabled={!selectedPipelineId}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="account"
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
              control={form.control}
              name="location"
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

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export const SyncErkhetPipelineRemainderConfigForm = () => {
  const { t } = useTranslation('mongolian');
  const [showNewConfig, setShowNewConfig] = useState(false);
  const { createPipelineRemainderConfig, loading: createLoading } =
    useCreatePipelineRemainderConfig();
  const { data, refetch, loading } = useQuery(GET_CONFIGS_GET_VALUE, {
    variables: { code: 'remainderConfig' },
    fetchPolicy: 'network-only',
  });

  const configValue = data?.mnConfigs?.[0]?.value;

  const parseConfigValue = (value: any) => {
    if (!value) return null;
    return typeof value === 'string' ? JSON.parse(value) : value;
  };

  const parsedConfig = parseConfigValue(configValue);

  const handleSubmit = async (formData: AddPipelineRemainderConfig) => {
    try {
      const configsMapString = {
        remainderConfig: {
          title: formData.title,
          boardId: formData.boardId,
          pipelineId: formData.pipelineId,
          stageId: formData.stageId,
          account: formData.account,
          location: formData.location,
        },
      };

      await createPipelineRemainderConfig({
        variables: {
          code: 'remainderConfig',
          subId: formData.pipelineId,
          value: configsMapString.remainderConfig,
        },
      });

      await refetch();

      setShowNewConfig(false);
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="h-full w-full mx-auto max-w-2xl flex flex-col">
      {!parsedConfig || showNewConfig ? (
        <NewConfigForm
          onCancel={() => {
            if (parsedConfig) {
              setShowNewConfig(false);
            }
          }}
          onSubmit={handleSubmit}
          loading={createLoading}
        />
      ) : (
        <EditConfigForm
          config={parsedConfig}
          onNewConfig={() => setShowNewConfig(true)}
          onSubmit={handleSubmit}
          loading={createLoading}
        />
      )}
    </div>
  );
};
