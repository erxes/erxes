import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, AlertDialog, Accordion, Form, Input } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useEbarimtReturnConfigSave } from '@/ebarimt/settings/stage-in-return-ebarimt-config/hooks/useEbarimtReturnConfigSave';
import { useEbarimtReturnConfigState } from '@/ebarimt/settings/stage-in-return-ebarimt-config/hooks/useEbarimtReturnConfigState';
import { SelectSalesBoard } from '@/ebarimt/settings/stage-in-return-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectPipeline } from '@/ebarimt/settings/stage-in-return-ebarimt-config/components/selects/SelectPipeline';
import { SelectStage } from '@/ebarimt/settings/stage-in-return-ebarimt-config/components/selects/SelectStage';
import { addEBarimtReturnConfigSchema } from '@/ebarimt/settings/stage-in-return-ebarimt-config/types/addEBarimtReturnConfigSchema';
import { ReturnEbarimtConfig } from '@/ebarimt/settings/stage-in-return-ebarimt-config/types';

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

  const handleBoardChange = useCallback(
    (value: string) => {
      form.setValue('destinationStageBoard', value);
      form.setValue('pipelineId', '');
      form.setValue('stageId', '');
    },
    [form],
  );

  const handlePipelineChange = useCallback(
    (value: string) => {
      form.setValue('pipelineId', value);
      form.setValue('stageId', '');
    },
    [form],
  );

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
                    onValueChange={handleBoardChange}
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
                    onValueChange={handlePipelineChange}
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

          <div className="flex justify-end gap-2">
            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <AlertDialog.Trigger asChild>
                <Button variant="ghost" size="sm">
                  <p className="text-black">Delete</p>
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

export const ReturnEBarimtConfigForm = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);

  const {
    localConfigsMap,
    configId: initialConfigId,
    addNewConfig: addConfigToState,
    deleteConfig: deleteConfigFromState,
    saveConfig: saveConfigToState,
  } = useEbarimtReturnConfigState();

  useEffect(() => {
    if (initialConfigId) {
      setCurrentConfigId(initialConfigId);
    }
  }, [initialConfigId]);

  const { saveConfigsToServer } = useEbarimtReturnConfigSave();

  const addNewConfig = () => {
    const updatedConfigsMap = addConfigToState();
    const keys = Object.keys(updatedConfigsMap);
    setOpenItems([keys[keys.length - 1]]);
  };

  const deleteConfig = async (configKey: string) => {
    const updatedConfigsMap = deleteConfigFromState(configKey);

    if (!currentConfigId) return;

    if (Object.keys(updatedConfigsMap).length === 0) {
      // Handle delete all configs - would need remove function
      await saveConfigsToServer(updatedConfigsMap, 'update', currentConfigId);
    } else {
      await saveConfigsToServer(updatedConfigsMap, 'update', currentConfigId);
    }
  };

  const saveConfig = async (configKey: string, configData: any) => {
    const updatedConfigsMap = saveConfigToState(configKey, configData);

    if (!currentConfigId) {
      const newId = await saveConfigsToServer(updatedConfigsMap, 'create');
      setCurrentConfigId(newId);
    } else {
      await saveConfigsToServer(updatedConfigsMap, 'update', currentConfigId);
    }
  };

  return (
    <div className="h-full w-full p-6 overflow-y-auto">
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-xl font-semibold">Return Ebarimt</h1>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={addNewConfig}
            className="flex items-center gap-2"
          >
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
            <Accordion
              type="multiple"
              value={openItems}
              onValueChange={setOpenItems}
              className="w-full"
            >
              {Object.keys(localConfigsMap).map((configKey) => (
                <Accordion.Item key={configKey} value={configKey}>
                  <Accordion.Trigger className="px-4 py-3 hover:no-underline text-left font-medium cursor-pointer">
                    <div className="flex justify-between items-center w-full">
                      <span>
                        {localConfigsMap[configKey].title || 'Untitled Config'}
                      </span>
                    </div>
                  </Accordion.Trigger>
                  <Accordion.Content className="pt-4">
                    <div className="p-4">
                      <ReturnEbarimtConfigCard
                        config={localConfigsMap[configKey]}
                        configKey={configKey}
                        onSave={saveConfig}
                        onDelete={deleteConfig}
                      />
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
};
