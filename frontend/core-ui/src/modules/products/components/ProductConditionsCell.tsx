import { IconCheck, IconPlus } from '@tabler/icons-react';
import {
  Badge,
  Command,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useProductConditionsCell } from '@/products/hooks/useProductConditionsCell';
import { ConditionQuickCreate } from '@/products/settings/components/productsConfig/condition/ConditionQuickCreate';

export const ProductConditionsCell = ({
  productId,
  conditionCodes,
}: {
  productId: string;
  conditionCodes: string[];
}) => {
  const { t } = useTranslation('product');
  const {
    conditions,
    loading,
    nameByCode,
    search,
    setSearch,
    canCreate,
    newName,
    startCreate,
    cancelCreate,
    handleCreated,
    onOpenChange,
    toggle,
  } = useProductConditionsCell(productId, conditionCodes);

  return (
    <PopoverScoped onOpenChange={onOpenChange}>
      <RecordTableInlineCell.Trigger>
        <div className="flex gap-1 overflow-hidden">
          {conditionCodes.map((code) => (
            // A code whose condition was removed still shows, so it is not lost silently.
            <Badge
              key={code}
              variant="secondary"
              className={nameByCode.has(code) ? '' : 'text-muted-foreground'}
            >
              {nameByCode.get(code) || code}
            </Badge>
          ))}
        </div>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        {newName ? (
          <ConditionQuickCreate
            defaultName={newName}
            onBack={cancelCreate}
            onCreated={handleCreated}
          />
        ) : (
          <Command>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder={t('conditions')}
            />
            <Command.List>
              <Command.Empty>
                {loading
                  ? t('loading', 'Loading...')
                  : t('no-conditions', 'No conditions yet')}
              </Command.Empty>
              {conditions.map(({ _id, code, name }) => (
                <Command.Item
                  key={_id}
                  value={`${code} ${name}`}
                  onSelect={() => toggle(code)}
                >
                  <span className="flex-1">{name}</span>
                  <span className="text-muted-foreground">{code}</span>
                  <IconCheck
                    className={
                      conditionCodes.includes(code)
                        ? 'size-4 text-primary'
                        : 'size-4 invisible'
                    }
                  />
                </Command.Item>
              ))}
              {canCreate && (
                // Never filtered out, whatever was typed.
                <Command.Item
                  value={`create ${search}`}
                  forceMount
                  onSelect={startCreate}
                  className="font-medium"
                >
                  <IconPlus />
                  {t('create-condition', 'Create condition')}: "{search}"
                </Command.Item>
              )}
            </Command.List>
          </Command>
        )}
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
