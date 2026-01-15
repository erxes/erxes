import { Button, Form, Input, Card, AlertDialog } from 'erxes-ui';
import { SelectSalesBoard } from '@/ebarimt/settings/stage-in-return-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectPipeline } from '@/ebarimt/settings/stage-in-return-ebarimt-config/components/selects/SelectPipeline';
import { SelectStage } from '@/ebarimt/settings/stage-in-return-ebarimt-config/components/selects/SelectStage';
import { ReturnEbarimtConfig } from '@/ebarimt/settings/stage-in-return-ebarimt-config/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addEBarimtReturnConfigSchema } from '@/ebarimt/settings/stage-in-return-ebarimt-config/types/addEBarimtReturnConfigSchema';
import { IconPlus } from '@tabler/icons-react';
import { useEbarimtReturnConfigState } from '@/ebarimt/settings/stage-in-return-ebarimt-config/hooks/useEbarimtReturnConfigState';
import { useEbarimtReturnConfigSave } from '@/ebarimt/settings/stage-in-return-ebarimt-config/hooks/useEbarimtReturnConfigSave';

const ReturnEbarimtConfigCard = ({
  config,
  configKey,
  onSave,
  onDelete,
}: {
  config: ReturnEbarimtConfig;
  configKey: string;
  onSave: (key: string, data: ReturnEbarimtConfig) => void;
  onDelete: (key: string) => void;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(addEBarimtReturnConfigSchema),
    defaultValues: {
      title: config.title || '',
      destinationStageBoard: config.destinationStageBoard || '',
      pipelineId: config.pipelineId || '',
      stageId: config.stageId || '',
      userEmail: config.userEmail || '',
      hasVat: config.hasVat || false,
      hasCitytax: config.hasCitytax || false,
    },
  });

  const selectedBoardId = form.watch('destinationStageBoard');
  const selectedPipelineId = form.watch('pipelineId');

  const handleSubmit = (data: ReturnEbarimtConfig) => {
    onSave(configKey, data);
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium">
          {config.title || 'Untitled Config'}
        </h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Field
              name="title"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Title</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="Title" />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="destinationStageBoard"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Destination Stage Board</Form.Label>
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
                  <Form.Label>Pipeline</Form.Label>
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
                  <Form.Label>Stage</Form.Label>
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

          <div className="flex justify-end">
            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <AlertDialog.Trigger asChild>
                <Button variant="ghost" size="sm" className="">
                  <p className="text-black"> Delete</p>
                </Button>
              </AlertDialog.Trigger>
              <AlertDialog.Content>
                <AlertDialog.Header>
                  <AlertDialog.Title>Delete Configuration</AlertDialog.Title>
                  <AlertDialog.Description>
                    Are you sure you want to delete "
                    {config.title || 'Untitled Config'}"? This action cannot be
                    undone.
                  </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                  <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                  <AlertDialog.Action
                    onClick={() => {
                      onDelete(configKey);
                      setIsDeleteDialogOpen(false);
                    }}
                    className=""
                  >
                    Delete
                  </AlertDialog.Action>
                </AlertDialog.Footer>
              </AlertDialog.Content>
            </AlertDialog>
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export const ReturnEbarimtConfigForm = () => {
  const {
    localConfigsMap,
    loading,
    refetch,
    addNewConfig: addConfig,
    deleteConfig: deleteConfigHandler,
    saveConfig: saveConfigHandler,
  } = useEbarimtReturnConfigState();

  const { saveConfigsToServer } = useEbarimtReturnConfigSave();

  const addNewConfig = () => {
    const updatedConfigsMap = addConfig();
    saveConfigsToServer(updatedConfigsMap, refetch, 'create');
  };

  const deleteConfig = (configKey: string) => {
    const updatedConfigsMap = deleteConfigHandler(configKey);
    saveConfigsToServer(updatedConfigsMap, refetch, 'delete');
  };

  const saveConfig = (configKey: string, configData: ReturnEbarimtConfig) => {
    const updatedConfigsMap = saveConfigHandler(configKey, configData);
    saveConfigsToServer(updatedConfigsMap, refetch, 'update');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full w-full p-6 overflow-y-auto">
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-xl font-semibold">Return Ebarimt</h1>
        </div>

        <div className="flex justify-end">
          <Button onClick={addNewConfig} className="flex items-center gap-2">
            <IconPlus className="h-4 w-4" />
            New Config
          </Button>
        </div>

        <div className="space-y-4">
          {Object.keys(localConfigsMap).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No configurations found. Click "New Config" to create one.
            </div>
          ) : (
            Object.keys(localConfigsMap).map((configKey) => (
              <ReturnEbarimtConfigCard
                key={configKey}
                config={localConfigsMap[configKey]}
                configKey={configKey}
                onSave={saveConfig}
                onDelete={deleteConfig}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
