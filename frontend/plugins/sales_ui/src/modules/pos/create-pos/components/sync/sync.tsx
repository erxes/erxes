import { Button, Input, Label, Select, Form } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { IconPlus, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { syncCardSettingsAtom } from '../../states/posCategory';
import { IPosDetail } from '@/pos/pos-detail/types/IPos';
import { SelectBranches, SelectMember, useBranchesMain } from 'ui-modules';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SelectPipelineFormItem } from '../../hooks/useSelectPipeline';
import { SelectBoardFormItem } from '../../hooks/useSelectBoard';
import { SelectStageFormItem } from '../../hooks/useSelectStage';
import { useFieldsCombined } from '../../hooks/useFieldsCombined';
import { CardsConfig } from '../../types/syncCard';
import { SyncCardConfig } from '../../types';

interface SyncCardFormProps {
  posDetail?: IPosDetail;
  isReadOnly?: boolean;
  onDataChange?: (cardsConfig: CardsConfig) => void;
}

export default function SyncCardForm({
  isReadOnly = false,
  onDataChange,
  posDetail,
}: SyncCardFormProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [syncCardSettings, setSyncCardSettings] = useAtom(syncCardSettingsAtom);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [editingConfig, setEditingConfig] = useState<SyncCardConfig | null>(
    null,
  );
  const [isInitialized, setIsInitialized] = useState(false);

  const branchForm = useForm<{ branch: string }>({
    defaultValues: { branch: '' },
    values: { branch: syncCardSettings.currentConfig.branch || '' },
  });

  const editBranchForm = useForm<{ branch: string }>({
    defaultValues: { branch: '' },
    values: { branch: editingConfig?.branch || '' },
  });

  const { fields: fetchedFields } = useFieldsCombined({
    contentType: 'sales:deal',
  });
  const { branches } = useBranchesMain();
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

  useEffect(() => {
    if (posDetail?.cardsConfig && !isInitialized && branches) {
      const configs: SyncCardConfig[] = [];

      Object.entries(posDetail.cardsConfig).forEach(
        ([key, config]: [string, any]) => {
          const branchId = config.branchId || key;
          const branchName =
            branches?.find((b) => b._id === branchId)?.title || key;

          configs.push({
            title: config.title || '',
            branch: branchId,
            branchName: branchName,
            stageBoard: config.boardId || '',
            pipeline: config.pipelineId || '',
            stage: config.stageId || '',
            assignedUsers: Array.isArray(config.assignedUserIds)
              ? config.assignedUserIds.join(',')
              : config.assignedUserIds || '',
            mapField: config.deliveryMapField || '',
          });
        },
      );

      setSyncCardSettings((prev) => ({
        ...prev,
        configs,
      }));
      setIsInitialized(true);
    }
  }, [posDetail?.cardsConfig, isInitialized, setSyncCardSettings, branches]);

  useEffect(() => {
    if (onDataChange) {
      const cardsConfig: CardsConfig = {};
      syncCardSettings.configs.forEach((config) => {
        const branchKey = config.branchName || config.branch || 'all';

        cardsConfig[branchKey] = {
          branchId: config.branch || 'all',
          boardId: config.stageBoard || '',
          pipelineId: config.pipeline || '',
          stageId: config.stage || '',
          assignedUserIds: config.assignedUsers
            ? config.assignedUsers.split(',').filter(Boolean)
            : [],
          deliveryMapField: config.mapField || '',
          title: config.title || '',
        };
      });
      onDataChange(cardsConfig);
    }
  }, [syncCardSettings.configs, onDataChange]);

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
    const singleBranchId = Array.isArray(branchId)
      ? branchId[0]
      : branchId || '';
    const branchName =
      branches?.find((b) => b._id === singleBranchId)?.title || '';
    setSyncCardSettings({
      ...syncCardSettings,
      currentConfig: {
        ...syncCardSettings.currentConfig,
        branch: singleBranchId,
        branchName: branchName,
      },
    });
  };

  const handleUserChange = (userId: string | string[] | null) => {
    setSyncCardSettings({
      ...syncCardSettings,
      currentConfig: {
        ...syncCardSettings.currentConfig,
        assignedUsers: userId
          ? Array.isArray(userId)
            ? userId.join(',')
            : userId
          : '',
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
      showNewConfig: false,
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

  const handleToggleExpand = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
      setEditingConfig(null);
    } else {
      setExpandedIndex(index);
      setEditingConfig({ ...syncCardSettings.configs[index] });
    }
  };

  const handleDeleteConfig = (index: number) => {
    const newConfigs = syncCardSettings.configs.filter((_, i) => i !== index);
    setSyncCardSettings({
      ...syncCardSettings,
      configs: newConfigs,
    });
    setExpandedIndex(null);
  };

  const handleSaveEdit = (index: number) => {
    if (!editingConfig) return;
    const newConfigs = [...syncCardSettings.configs];
    newConfigs[index] = editingConfig;
    setSyncCardSettings({
      ...syncCardSettings,
      configs: newConfigs,
    });
    setEditingConfig(null);
  };

  const handleEditInputChange = (field: string, value: string) => {
    if (!editingConfig) return;
    setEditingConfig({
      ...editingConfig,
      [field]: value,
    });
  };

  const handleEditBranchChange = (branchId: string | string[] | undefined) => {
    if (!editingConfig) return;
    const singleBranchId = Array.isArray(branchId)
      ? branchId[0]
      : branchId || '';
    const branchName =
      branches?.find((b) => b._id === singleBranchId)?.title || '';
    setEditingConfig({
      ...editingConfig,
      branch: singleBranchId,
      branchName: branchName,
    });
  };

  const handleEditUserChange = (userId: string | string[] | null) => {
    if (!editingConfig) return;
    setEditingConfig({
      ...editingConfig,
      assignedUsers: userId
        ? Array.isArray(userId)
          ? userId.join(',')
          : userId
        : '',
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
            variant="default"
            type="button"
            onClick={handleToggleNewConfig}
            className="flex gap-2 items-center"
            disabled={isReadOnly}
          >
            <IconPlus size={16} />
            New config
          </Button>
        </div>

        {syncCardSettings.showNewConfig && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-primary">NEW CONFIG</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm">TITLE</Label>
                <Input
                  value={syncCardSettings.currentConfig.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter title"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Form {...branchForm}>
                  <Form.Field
                    control={branchForm.control}
                    name="branch"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label className="text-sm">
                          CHOOSE BRANCH
                        </Form.Label>
                        <Form.Control>
                          <SelectBranches.FormItem
                            value={field.value}
                            onValueChange={(val) => {
                              field.onChange(val);
                              handleBranchChange(val);
                            }}
                            mode="single"
                            className="w-full h-8"
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </Form>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm">CHOOSE STAGE BOARD</Label>
                <SelectBoardFormItem
                  value={syncCardSettings.currentConfig.stageBoard}
                  onValueChange={(value) =>
                    handleSelectChange('stageBoard', value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">PIPELINE</Label>
                <SelectPipelineFormItem
                  value={syncCardSettings.currentConfig.pipeline}
                  onValueChange={(value) =>
                    handleSelectChange('pipeline', value)
                  }
                  boardId={syncCardSettings.currentConfig.stageBoard}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm">STAGE</Label>
                <SelectStageFormItem
                  value={syncCardSettings.currentConfig.stage}
                  onValueChange={(value) => handleSelectChange('stage', value)}
                  pipelineId={syncCardSettings.currentConfig.pipeline}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">CHOOSE ASSIGNED USERS</Label>
                <SelectMember
                  value={
                    syncCardSettings.currentConfig.assignedUsers
                      ? syncCardSettings.currentConfig.assignedUsers
                          .split(',')
                          .filter(Boolean)
                      : undefined
                  }
                  onValueChange={handleUserChange}
                  className="justify-start w-full h-8"
                  mode="multiple"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">CHOOSE MAP FIELD</Label>
              <Select
                value={syncCardSettings.currentConfig.mapField}
                onValueChange={(value) => handleSelectChange('mapField', value)}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select" />
                </Select.Trigger>
                <Select.Content>
                  {fields.map((field) => (
                    <Select.Item key={field.name} value={field.name}>
                      {field.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button variant="default" type="button" onClick={handleAddConfig}>
                Add Config
              </Button>
            </div>
          </div>
        )}

        {syncCardSettings.configs.length > 0 && (
          <div className="space-y-3">
            {syncCardSettings.configs.map((config, index) => (
              <div key={index} className="rounded-lg border">
                <button
                  type="button"
                  onClick={() => handleToggleExpand(index)}
                  className="flex justify-between items-center p-4 w-full"
                >
                  <span className="font-medium">{config.title}</span>
                  {expandedIndex === index ? (
                    <IconChevronUp size={20} />
                  ) : (
                    <IconChevronDown size={20} />
                  )}
                </button>

                {expandedIndex === index && editingConfig && (
                  <div className="p-4 space-y-4 border-t">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm">TITLE</Label>
                          <Input
                            value={editingConfig.title}
                            onChange={(e) =>
                              handleEditInputChange('title', e.target.value)
                            }
                            placeholder="Enter title"
                          />
                        </div>

                        <div className="space-y-2">
                          <Form {...editBranchForm}>
                            <Form.Field
                              control={editBranchForm.control}
                              name="branch"
                              render={({ field }) => (
                                <Form.Item>
                                  <Form.Label className="text-sm">
                                    CHOOSE BRANCH
                                  </Form.Label>
                                  <Form.Control>
                                    <SelectBranches.FormItem
                                      value={field.value}
                                      onValueChange={(val) => {
                                        field.onChange(val);
                                        handleEditBranchChange(val);
                                      }}
                                      mode="single"
                                      className="w-full h-8"
                                    />
                                  </Form.Control>
                                  <Form.Message />
                                </Form.Item>
                              )}
                            />
                          </Form>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm">CHOOSE STAGE BOARD</Label>
                          <SelectBoardFormItem
                            value={editingConfig.stageBoard}
                            onValueChange={(value) =>
                              handleEditInputChange('stageBoard', value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">PIPELINE</Label>
                          <SelectPipelineFormItem
                            value={editingConfig.pipeline}
                            onValueChange={(value) =>
                              handleEditInputChange('pipeline', value)
                            }
                            boardId={editingConfig.stageBoard}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm">STAGE</Label>
                          <SelectStageFormItem
                            value={editingConfig.stage}
                            onValueChange={(value) =>
                              handleEditInputChange('stage', value)
                            }
                            pipelineId={editingConfig.pipeline}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">
                            CHOOSE ASSIGNED USERS
                          </Label>
                          <SelectMember
                            value={
                              editingConfig.assignedUsers
                                ? editingConfig.assignedUsers
                                    .split(',')
                                    .filter(Boolean)
                                : undefined
                            }
                            onValueChange={handleEditUserChange}
                            className="justify-start w-full h-8"
                            mode="multiple"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">CHOOSE MAP FIELD</Label>
                        <Select
                          value={editingConfig.mapField}
                          onValueChange={(value) =>
                            handleEditInputChange('mapField', value)
                          }
                        >
                          <Select.Trigger>
                            <Select.Value placeholder="Select" />
                          </Select.Trigger>
                          <Select.Content>
                            {fields.map((field) => (
                              <Select.Item key={field.name} value={field.name}>
                                {field.label}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => handleDeleteConfig(index)}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="default"
                          type="button"
                          onClick={() => handleSaveEdit(index)}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
