import {
  Button,
  Collapsible,
  InfoCard,
  Input,
  Label,
  Select,
  Skeleton,
  useToast,
} from 'erxes-ui';
import {
  IconCheck,
  IconPlus,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectProduct } from 'ui-modules';
import type { IField } from 'ui-modules';
import {
  useSimilarityConfig,
  type SimilarityConfigGroup,
  type SimilarityConfigRule,
} from '@/products/settings/components/productsConfig/similarityConfig/SimilarityConfigContext';

type ActionInProgress = 'saving' | 'deleting' | null;

export const SimilarityConfigGroupList = () => {
  const { t } = useTranslation('product', { keyPrefix: 'similarity-config' });
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'core-modules' });
  const { toast } = useToast();
  const [actionInProgress, setActionInProgress] = useState<ActionInProgress>(null);
  const {
    similarityConfigGroups,
    loading,
    updating,
    hasChanges,
    filterFieldOptions,
    filterFieldOptionsByGroup,
    getFilterFieldLabel,
    fieldGroupsMap,
    fieldGroupNames,
    openKeys,
    setOpenKey,
    handleUpdateGroup,
    handleUpdateRule,
    handleAddRule,
    handleDeleteRule,
    handleDeleteGroup,
    handleSave,
  } = useSimilarityConfig();

  const handleSaveWithToast = async () => {
    setActionInProgress('saving');
    try {
      await handleSave();
      toast({ title: t('saved'), variant: 'success' });
    } catch {
      toast({ title: t('save-failed'), variant: 'destructive' });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteGroupWithToast = async (groupKey: string) => {
    setActionInProgress('deleting');
    try {
      await handleDeleteGroup(groupKey);
      toast({ title: t('group-deleted'), variant: 'success' });
    } catch {
      toast({ title: t('error'), variant: 'destructive' });
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <InfoCard title={t('similarity-group')}>
          <InfoCard.Content>
            <Skeleton className="w-full h-64" />
          </InfoCard.Content>
        </InfoCard>
      </div>
    );
  }

  const allFields = Object.values(fieldGroupsMap).flat();

  return (
    <div className="space-y-6">
      <InfoCard title={t('similarity-group')}>
        <InfoCard.Content>
          <div className="space-y-4">
            {similarityConfigGroups.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                {t('no-groups')}
              </p>
            ) : (
              similarityConfigGroups.map((group: SimilarityConfigGroup) => {
                const groupKey = group.groupKey;
                const isOpen = openKeys[groupKey] ?? false;

                return (
                  <Collapsible
                    key={groupKey}
                    open={isOpen}
                    onOpenChange={(open) => setOpenKey(groupKey, open)}
                    className="rounded-lg border"
                  >
                    <Collapsible.Trigger asChild>
                      <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-accent/50">
                        <div className="flex gap-2 items-center">
                          <IconSettings className="w-5 h-5 text-muted-foreground" />
                          <span className="text-lg font-medium">
                            {group.title || t('new-similarity-group')}
                          </span>
                        </div>
                        <Collapsible.TriggerIcon />
                      </div>
                    </Collapsible.Trigger>
                    <Collapsible.Content className="p-4 space-y-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>{t('title')}</Label>
                          <Input
                            value={group.title || ''}
                            onChange={(e) =>
                              handleUpdateGroup(groupKey, {
                                title: e.target.value,
                              })
                            }
                            placeholder={t('new-similarity-group')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('filter-field')}</Label>
                          <Select
                            value={group.filterField || 'code'}
                            onValueChange={(value) =>
                              handleUpdateGroup(groupKey, {
                                filterField: value,
                              })
                            }
                          >
                            <Select.Trigger>
                              <Select.Value>
                                {getFilterFieldLabel(
                                  group.filterField || 'code',
                                )}
                              </Select.Value>
                            </Select.Trigger>
                            <Select.Content>
                              {group.filterField &&
                                !filterFieldOptions.some(
                                  (o) => o.value === group.filterField,
                                ) && (
                                  <Select.Item
                                    value={group.filterField}
                                    key={group.filterField}
                                  >
                                    {getFilterFieldLabel(group.filterField)}
                                  </Select.Item>
                                )}
                              <Select.Group>
                                <Select.Label>
                                  {t('basic-information')}
                                </Select.Label>
                                {filterFieldOptionsByGroup.basic.map(
                                  (option: {
                                    value: string;
                                    label: string;
                                  }) => (
                                    <Select.Item
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </Select.Item>
                                  ),
                                )}
                              </Select.Group>
                              {filterFieldOptionsByGroup.custom.length > 0 && (
                                <>
                                  <Select.Separator />
                                  <Select.Group>
                                    {filterFieldOptionsByGroup.custom.map(
                                      (option: {
                                        value: string;
                                        label: string;
                                      }) => (
                                        <Select.Item
                                          key={option.value}
                                          value={option.value}
                                        >
                                          {option.label}
                                        </Select.Item>
                                      ),
                                    )}
                                  </Select.Group>
                                </>
                              )}
                            </Select.Content>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('code-mask')}</Label>
                          <Input
                            value={group.mask ?? ''}
                            onChange={(e) =>
                              handleUpdateGroup(groupKey, {
                                mask: e.target.value,
                              })
                            }
                            placeholder={t('enter-mask')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('default-product')}</Label>
                          <SelectProduct
                            value={group.defaultProduct || ''}
                            onValueChange={(value) =>
                              handleUpdateGroup(groupKey, {
                                defaultProduct: value as string,
                              })
                            }
                            placeholder={t('default-product')}
                            defaultSearchValue={group.mask ?? ''}
                          />
                        </div>
                      </div>

                      {group.rules && group.rules.length > 0 && (
                        <div className="p-4 space-y-3 rounded-lg border">
                          <div className="space-y-2">
                            {group.rules.map(
                              (
                                rule: SimilarityConfigRule,
                                ruleIndex: number,
                              ) => {
                                const ruleId = rule.id ?? `rule-${ruleIndex}`;
                                return (
                                  <div
                                    key={ruleId}
                                    className="grid grid-cols-3 gap-4"
                                  >
                                    <div className="space-y-2">
                                      <Label>{t('rule-title')}</Label>
                                      <Input
                                        value={rule.title || ''}
                                        onChange={(e) =>
                                          handleUpdateRule(groupKey, ruleId, {
                                            title: e.target.value,
                                          })
                                        }
                                        placeholder={t('rule-title')}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>{t('field-group')}</Label>
                                      <Select
                                        value={rule.fieldGroupId || ''}
                                        onValueChange={(value) =>
                                          handleUpdateRule(groupKey, ruleId, {
                                            fieldGroupId: value,
                                          })
                                        }
                                      >
                                        <Select.Trigger>
                                          <Select.Value
                                            placeholder={t('empty')}
                                          />
                                        </Select.Trigger>
                                        <Select.Content>
                                          {Object.keys(fieldGroupsMap).map(
                                            (groupKey) => (
                                              <Select.Item
                                                key={groupKey}
                                                value={groupKey}
                                              >
                                                {fieldGroupNames[groupKey] ??
                                                  groupKey}
                                              </Select.Item>
                                            ),
                                          )}
                                        </Select.Content>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>{t('field')}</Label>
                                      <div className="flex gap-2 items-center">
                                        <Select
                                          value={rule.fieldId || ''}
                                          onValueChange={(value) =>
                                            handleUpdateRule(groupKey, ruleId, {
                                              fieldId: value,
                                            })
                                          }
                                          disabled={!rule.fieldGroupId}
                                        >
                                          <Select.Trigger>
                                            <Select.Value
                                              placeholder={t('empty')}
                                            />
                                          </Select.Trigger>
                                          <Select.Content>
                                            {(rule.fieldGroupId
                                              ? fieldGroupsMap[
                                                  rule.fieldGroupId
                                                ] || []
                                              : allFields
                                            ).map((field: IField) => (
                                              <Select.Item
                                                key={field._id}
                                                value={field._id}
                                              >
                                                {field.name}
                                              </Select.Item>
                                            ))}
                                          </Select.Content>
                                        </Select>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            handleDeleteRule(groupKey, ruleId)
                                          }
                                          className="w-6 h-6 text-destructive"
                                        >
                                          <IconTrash className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => handleAddRule(groupKey)}
                        >
                          <IconPlus />
                          {t('add-rule')}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteGroupWithToast(groupKey)}
                          disabled={updating}
                        >
                          <IconTrash />
                          {actionInProgress === 'deleting'
                            ? t('deleting')
                            : tCommon('delete')}
                        </Button>
                        {hasChanges && (
                          <Button
                            onClick={() => handleSaveWithToast()}
                            disabled={updating}
                          >
                            <IconCheck />
                            {actionInProgress === 'saving'
                              ? t('saving')
                              : tCommon('save')}
                          </Button>
                        )}
                      </div>
                    </Collapsible.Content>
                  </Collapsible>
                );
              })
            )}
          </div>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
