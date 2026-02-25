import { useState, useCallback } from 'react';
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
        title: 'Error',
        description: 'Title is required',
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
        title: 'Save failed',
        description: msg || 'Unknown error',
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
  ]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete(initialCodeGroup);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Delete failed',
        description: msg || 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [initialCodeGroup, onDelete, toast]);

  return (
    <Collapsible open={isOpen} onOpenChange={() => onToggle?.()}>
      <Collapsible.Trigger className="flex gap-3 items-center px-4 py-3 w-full border-b">
        <IconSettings size={20} className="text-muted-foreground" />
        <span className="flex-1 font-medium text-left">
          {title || 'New similarity group'}
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
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New similarity group"
              />
            </div>
            <div className="space-y-2">
              <Label>Filter Field</Label>
              <FilterFieldSelect
                value={filterField}
                onValueChange={setFilterField}
              />
            </div>
            <div className="space-y-2">
              <Label>Code Mask</Label>
              <Input
                value={codeGroupKey}
                onChange={(e) => setCodeGroupKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Default Product</Label>
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
                    <Label>Title</Label>
                    <Input
                      value={rule.title}
                      onChange={(e) =>
                        handleRuleChange(index, 'title', e.target.value)
                      }
                      placeholder="Enter title"
                    />
                  </div>

                  <div className="space-y-2 w-full">
                    <Label>Field Group</Label>
                    <RuleGroupSelect
                      value={rule.groupId}
                      onValueChange={(value) =>
                        handleRuleChange(index, 'groupId', value)
                      }
                    />
                  </div>

                  <div className="space-y-2 w-full">
                    <Label>Field</Label>
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
              Add Rule
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
              {isDeleting ? 'Deleting...' : 'Delete'}
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
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
};
