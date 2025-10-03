import { Button, Input, Label, Select } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { IconPlus } from '@tabler/icons-react';
import { syncCardSettingsAtom } from '../../states/posCategory';
import { IPosDetail } from '@/pos/pos-detail/types/IPos';
import { SelectBranches, SelectMember } from 'ui-modules';

interface SyncCardFormProps {
  posDetail?: IPosDetail;
  isReadOnly?: boolean;
}

export default function SyncCardForm({
  isReadOnly = false,
}: SyncCardFormProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [syncCardSettings, setSyncCardSettings] = useAtom(syncCardSettingsAtom);

  const handleToggleNewConfig = () => {
    setSyncCardSettings({
      ...syncCardSettings,
      showNewConfig: !syncCardSettings.showNewConfig,
    });
  };

  const handleInputChange = (
    field: keyof typeof syncCardSettings.currentConfig,
    value: string,
  ) => {
    setSyncCardSettings({
      ...syncCardSettings,
      currentConfig: {
        ...syncCardSettings.currentConfig,
        [field]: value,
      },
    });
  };

  const handleSelectChange = (
    field: keyof typeof syncCardSettings.currentConfig,
    value: string,
  ) => {
    setSyncCardSettings({
      ...syncCardSettings,
      currentConfig: {
        ...syncCardSettings.currentConfig,
        [field]: value,
      },
    });
  };

  const handleBranchChange = (branchId: string | string[] | undefined) => {
    setSyncCardSettings({
      ...syncCardSettings,
      currentConfig: {
        ...syncCardSettings.currentConfig,
        branch: Array.isArray(branchId) ? branchId[0] : branchId || '',
      },
    });
  };

  const handleUserChange = (userId: string | string[]) => {
    setSyncCardSettings({
      ...syncCardSettings,
      currentConfig: {
        ...syncCardSettings.currentConfig,
        assignedUsers: Array.isArray(userId) ? userId.join(',') : userId,
      },
    });
  };

  const handleAddConfig = () => {
    const newConfigs = [
      ...syncCardSettings.configs,
      { ...syncCardSettings.currentConfig },
    ];
    setSyncCardSettings({
      ...syncCardSettings,
      configs: newConfigs,
      currentConfig: {
        title: '',
        branch: '',
        stageBoard: '',
        pipeline: '',
        stage: '',
        assignedUsers: '',
        mapField: '',
      },
    });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (syncCardSettings.currentConfig.title) {
      handleAddConfig();
    }
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', 'complete');
    setSearchParams(newParams);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3">
      <div className="space-y-8">
        <div>
          <Button
            type="button"
            onClick={handleToggleNewConfig}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            disabled={isReadOnly}
          >
            <IconPlus size={16} />
            New config
          </Button>
        </div>
        {syncCardSettings.showNewConfig && (
          <div className="space-y-6">
            <h2 className="text-indigo-600 text-xl font-medium">NEW CONFIG</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">TITLE</Label>
                <Input
                  value={syncCardSettings.currentConfig.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter title"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">CHOOSE BRANCH</Label>
                <SelectBranches.Detail
                  value={syncCardSettings.currentConfig.branch}
                  onValueChange={handleBranchChange}
                  mode="single"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">
                  CHOOSE STAGE BOARD
                </Label>
                <Select
                  value={syncCardSettings.currentConfig.stageBoard}
                  onValueChange={(value) =>
                    handleSelectChange('stageBoard', value)
                  }
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Choose board" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="board1">Board 1</Select.Item>
                    <Select.Item value="board2">Board 2</Select.Item>
                    <Select.Item value="board3">Board 3</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">
                  CHOOSE ASSIGNED USERS
                </Label>
                <SelectMember
                  value={
                    syncCardSettings.currentConfig.assignedUsers || undefined
                  }
                  onValueChange={handleUserChange}
                  className="w-full h-8 justify-start bg-white hover:bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">PIPELINE</Label>
                <Select
                  value={syncCardSettings.currentConfig.pipeline}
                  onValueChange={(value) =>
                    handleSelectChange('pipeline', value)
                  }
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Choose pipeline" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="pipeline1">Pipeline 1</Select.Item>
                    <Select.Item value="pipeline2">Pipeline 2</Select.Item>
                    <Select.Item value="pipeline3">Pipeline 3</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">STAGE</Label>
                <Select
                  value={syncCardSettings.currentConfig.stage}
                  onValueChange={(value) => handleSelectChange('stage', value)}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Choose a stage" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="stage1">Stage 1</Select.Item>
                    <Select.Item value="stage2">Stage 2</Select.Item>
                    <Select.Item value="stage3">Stage 3</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-500">CHOOSE MAP FIELD</Label>
              <Select
                value={syncCardSettings.currentConfig.mapField}
                onValueChange={(value) => handleSelectChange('mapField', value)}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="field1">Field 1</Select.Item>
                  <Select.Item value="field2">Field 2</Select.Item>
                  <Select.Item value="field3">Field 3</Select.Item>
                </Select.Content>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleAddConfig}
                className="text-white"
              >
                Add Config
              </Button>
            </div>
          </div>
        )}

        {syncCardSettings.configs.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Saved Configurations</h3>
            <div className="divide-y">
              {syncCardSettings.configs.map((config, index) => (
                <div key={index} className="p-3">
                  <div className="font-medium">{config.title}</div>
                  <div className="text-sm text-gray-500">
                    Board: {config.stageBoard}, Pipeline: {config.pipeline},
                    Stage: {config.stage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
