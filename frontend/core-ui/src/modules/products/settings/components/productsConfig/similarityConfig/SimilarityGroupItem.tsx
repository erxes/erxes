import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Collapsible, Input, Label, useToast } from 'erxes-ui';
import {
  IconSettings,
  IconChevronDown,
  IconPlus,
  IconTrash,
  IconCheck,
  IconLoader2,
} from '@tabler/icons-react';
import { SelectProduct } from 'ui-modules';
import { ISimilarityGroupConfig, ISimilarityRule } from './types';
import { FilterFieldSelect } from './FilterFieldSelect';
import { RuleGroupSelect } from './RuleGroupSelect';
import { RuleFieldSelect } from './RuleFieldSelect';
import { nanoid } from 'nanoid';

interface ISimilarityGroupItemProps {
  codeGroupKey: string;
  config: ISimilarityGroupConfig;
  isOpen?: boolean;
  onToggle?: () => void;
  onSave: (
    oldCodeGroupKey: string,
    newCodeGroupKey: string,
    config: ISimilarityGroupConfig,
  ) => Promise<void>;
  onDelete: (codeGroupKey: string) => Promise<void>;
}

export const SimilarityGroupItem = ({
  codeGroupKey: initialCodeGroup,
  config: initialConfig,
  isOpen = false,
  onToggle,
  onSave,
  onDelete,
}: ISimilarityGroupItemProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'similarity-config' });
  const { toast } = useToast();
  const [title, setTitle] = useState(initialConfig.title || '');
  const [filterField, setFilterField] = useState(
    initialConfig.filterField || 'code',
  );
  const [codeGroupKey, setCodeGroupKey] = useState(
    initialConfig.codeMask || '',
  );
  const [defaultProduct, setDefaultProduct] = useState(
    initialConfig.defaultProduct || '',
  );
  const [rules, setRules] = useState<ISimilarityRule[]>(
    initialConfig.rules || [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddRule = () => {
    setRules([...rules, { id: nanoid(), title: '', groupId: '', fieldId: '' }]);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (
    index: number,
    field: keyof ISimilarityRule,
    value: string,
  ) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: value };
    setRules(updated);
  };

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      toast({
        title: t('error', 'Error'),
        description: t('title-required', 'Title is required'),
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(initialCodeGroup, codeGroupKey, {
        title,
        filterField,
        codeMask: codeGroupKey,
        defaultProduct,
        rules,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toast({
        title: t('save-failed', 'Save failed'),
        description: msg || t('unknown-error', 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    title,
    filterField,
    codeGroupKey,
    defaultProduct,
    rules,
    initialCodeGroup,
    onSave,
    toast,
    t,
  ]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete(initialCodeGroup);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toast({
        title: t('delete-failed', 'Delete failed'),
        description: msg || t('unknown-error', 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [initialCodeGroup, onDelete, toast, t]);

  return (
    <Collapsible open={isOpen} onOpenChange={() => onToggle?.()}>
      <Collapsible.Trigger className="flex gap-3 items-center px-4 py-3 w-full border-b">
        <IconSettings size={20} className="text-muted-foreground" />
        <span className="flex-1 font-medium text-left">
          {title || t('new-similarity-group', 'New similarity group')}
        </span>
        <IconChevronDown
          size={18}
          className={`text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Collapsible.Trigger>
      <Collapsible.Content>
        <div className="p-4 space-y-4 border-b">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{t('title', 'Title')}</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('new-similarity-group', 'New similarity group')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('filter-field', 'Filter Field')}</Label>
              <FilterFieldSelect
                value={filterField}
                onValueChange={setFilterField}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('code-mask', 'Code Mask')}</Label>
              <Input
                value={codeGroupKey}
                onChange={(e) => setCodeGroupKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('default-product', 'Default Product')}</Label>
              <SelectProduct
                value={defaultProduct || ''}
                defaultSearchValue={codeGroupKey}
                onValueChange={(value) =>
                  setDefaultProduct(
                    Array.isArray(value) ? value[0] || '' : value,
                  )
                }
              />
            </div>
          </div>

          {rules.length > 0 && (
            <div className="space-y-2">
              {rules.map((rule, index) => (
                <div key={rule.id} className="flex gap-2 items-end w-full">
                  <div className="space-y-2 w-full">
                    <Label>{t('title', 'Title')}</Label>
                    <Input
                      value={rule.title}
                      onChange={(e) =>
                        handleRuleChange(index, 'title', e.target.value)
                      }
                      placeholder={t('enter-title', 'Enter title')}
                    />
                  </div>

                  <div className="space-y-2 w-full">
                    <Label>{t('field-group', 'Field Group')}</Label>
                    <RuleGroupSelect
                      value={rule.groupId}
                      onValueChange={(value) =>
                        handleRuleChange(index, 'groupId', value)
                      }
                    />
                  </div>

                  <div className="space-y-2 w-full">
                    <Label>{t('field', 'Field')}</Label>
                    <RuleFieldSelect
                      groupId={rule.groupId}
                      value={rule.fieldId}
                      onValueChange={(value) =>
                        handleRuleChange(index, 'fieldId', value)
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRule(index)}
                    className="text-destructive shrink-0"
                  >
                    <IconTrash size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={handleAddRule}>
              <IconPlus size={16} />
              {t('add-rule', 'Add Rule')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
            >
              {isDeleting ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconTrash size={16} />
              )}
              {isDeleting ? t('deleting', 'Deleting...') : t('delete', 'Delete')}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isDeleting}
            >
              {isSaving ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconCheck size={16} />
              )}
              {isSaving ? t('saving', 'Saving...') : t('save', 'Save')}
            </Button>
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
};
