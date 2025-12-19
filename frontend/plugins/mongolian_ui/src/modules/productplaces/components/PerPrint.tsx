import React, { useState } from 'react';
import { Button, Form, Select } from 'erxes-ui';
import { Collapsible } from 'erxes-ui/components/collapsible';

import PerPrintConditions from './PerPrintConditions';

type Props = {
  config: any;
  currentConfigKey: string;
  save: (key: string, config: any) => void;
  delete: (currentConfigKey: string) => void;
};

const PerPrintSettings = ({
  config: initialConfig,
  currentConfigKey,
  save,
  delete: deleteConfig,
}: Props) => {
  const [config, setConfig] = useState(initialConfig);

  const onChangeConfig = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const addCondition = () => {
    onChangeConfig('conditions', [
      ...(config.conditions || []),
      { id: Math.random().toString() },
    ]);
  };

  const removeCondition = (id: string) => {
    onChangeConfig(
      'conditions',
      (config.conditions || []).filter((c) => c.id !== id),
    );
  };

  const editCondition = (id: string, condition: any) => {
    onChangeConfig(
      'conditions',
      (config.conditions || []).map((c) =>
        c.id === id ? condition : c,
      ),
    );
  };

  const onSave = () => {
    if (!config.stageId) return;
    save(config.stageId, config);
  };

  const onDelete = () => {
    deleteConfig(currentConfigKey);
  };

  return (
    <Collapsible
      defaultOpen={currentConfigKey === 'newPrintConfig'}
      className="rounded border p-4 space-y-6"
    >
      {/* HEADER */}
      <Collapsible.TriggerButton>
        <div className="flex w-full items-center justify-between">
          <span className="text-sm font-semibold">
            {config.title || 'Print config'}
          </span>
          <Collapsible.TriggerIcon className="h-4 w-4" />
        </div>
      </Collapsible.TriggerButton>

      {/* CONTENT */}
      <Collapsible.Content className="space-y-6">
        {/* TITLE */}
        <Form.Item>
          <Form.Label>Title</Form.Label>
          <Form.Control>
            <input
              value={config.title || ''}
              onChange={(e) =>
                onChangeConfig('title', e.target.value)
              }
            />
          </Form.Control>
        </Form.Item>

        {/* BOARD / PIPELINE / STAGE */}
        <div className="grid grid-cols-3 gap-4 rounded border p-4">
          <Form.Item>
            <Form.Label>Board</Form.Label>
            <Select
              value={config.boardId || ''}
              onValueChange={(v) =>
                onChangeConfig('boardId', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Select board" />
              </Select.Trigger>
              <Select.Content>
                {/* TODO: map boards */}
              </Select.Content>
            </Select>
          </Form.Item>

          <Form.Item>
            <Form.Label>Pipeline</Form.Label>
            <Select
              value={config.pipelineId || ''}
              onValueChange={(v) =>
                onChangeConfig('pipelineId', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Select pipeline" />
              </Select.Trigger>
              <Select.Content>
                {/* TODO: map pipelines */}
              </Select.Content>
            </Select>
          </Form.Item>

          <Form.Item>
            <Form.Label>Stage</Form.Label>
            <Select
              value={config.stageId || ''}
              onValueChange={(v) =>
                onChangeConfig('stageId', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Select stage" />
              </Select.Trigger>
              <Select.Content>
                {/* TODO: map stages */}
              </Select.Content>
            </Select>
          </Form.Item>
        </div>

        {/* CONDITIONS */}
        <div className="space-y-4">
          {(config.conditions || []).map((condition) => (
            <PerPrintConditions
              key={condition.id}
              condition={condition}
              onChange={editCondition}
              onRemove={removeCondition}
            />
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="secondary"
            onClick={addCondition}
          >
            Add condition
          </Button>

          <Button
            variant="ghost"
            onClick={onDelete}
          >
            Delete
          </Button>

          <Button
            variant="default"
            disabled={!config.stageId}
            onClick={onSave}
          >
            Save
          </Button>
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
};

export default PerPrintSettings;
