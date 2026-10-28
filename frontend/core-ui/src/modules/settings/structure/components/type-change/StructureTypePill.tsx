import { IconChevronDown, IconSettings } from '@tabler/icons-react';
import { Button, cn, Combobox, Command, Popover, Spinner } from 'erxes-ui';
import { SyntheticEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStructureWorkspace } from '../../contexts/StructureWorkspaceContext';
import { useStructureTypeChange } from '../../hooks/useStructureTypeChange';
import { useStructureTypeDialogs } from '../../hooks/useStructureTypeDialogs';
import {
  IStructureEntityTypeDetail,
  TStructureTreeEntity,
} from '../../types/structureEntity';
import { isStructureEntityArchived } from '../../utils/structureEntityStatus';
import { getStructureChangeableTypes } from '../../utils/structureTypeChange';
import { StructureEntityTypeIcon } from '../StructureEntityTypeIcon';

type TStructureTypePillEntity = Pick<
  TStructureTreeEntity,
  '_id' | 'typeId' | 'parentId' | 'status' | 'title'
>;

const PILL_CLASS_NAME =
  'inline-flex h-6 min-w-0 max-w-28 shrink items-center gap-1 rounded-full bg-accent px-2 text-xs text-foreground';

const stopPropagation = (event: SyntheticEvent) => event.stopPropagation();

const StructureTypePillLabel = ({
  type,
}: {
  type?: IStructureEntityTypeDetail;
}) => (
  <>
    <StructureEntityTypeIcon icon={type?.icon} className="size-3 shrink-0" />
    <span className="truncate">{type?.name}</span>
  </>
);

const StructureTypePillMenu = ({
  entity,
  className,
}: {
  entity: TStructureTypePillEntity;
  className?: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { types, typesById, entitiesById, childrenById } =
    useStructureWorkspace();
  const { openTypeSettings } = useStructureTypeDialogs();
  const { change, changing } = useStructureTypeChange();
  const [open, setOpen] = useState(false);
  const current = typesById.get(entity.typeId);
  const parentTypeId = entity.parentId
    ? entitiesById.get(entity.parentId)?.typeId
    : undefined;
  const allowedTypes = useMemo(
    () =>
      getStructureChangeableTypes(types, {
        parentTypeId,
        childTypeIds: (childrenById.get(entity._id) ?? [])
          .filter((child) => !isStructureEntityArchived(child))
          .map(({ typeId }) => typeId),
      }),
    [types, parentTypeId, childrenById, entity._id],
  );
  const choose = (type: IStructureEntityTypeDetail) => {
    setOpen(false);

    if (type._id !== entity.typeId) {
      void change(entity, type);
    }
  };

  return (
    <span
      role="presentation"
      className="contents"
      onClick={stopPropagation}
      onKeyDown={stopPropagation}
      onPointerDown={stopPropagation}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button
            variant="ghost"
            disabled={changing}
            className={cn(PILL_CLASS_NAME, 'hover:bg-accent/70', className)}
            aria-label={t('change-type-of', { title: entity.title })}
            title={current?.name}
          >
            <StructureTypePillLabel type={current} />
            {changing ? (
              <Spinner size="sm" />
            ) : (
              <IconChevronDown className="size-3 shrink-0 opacity-60" />
            )}
          </Button>
        </Popover.Trigger>
        <Combobox.Content className="min-w-60">
          <Command>
            <Command.Input placeholder={t('search-types')} />
            <Command.List>
              {allowedTypes.length === 0 && (
                <p className="px-2 py-3 text-xs text-muted-foreground">
                  {t('no-changeable-types')}
                </p>
              )}
              {allowedTypes.map((type) => (
                <Command.Item
                  key={type._id}
                  value={`${type.name} ${type._id}`}
                  onSelect={() => choose(type)}
                >
                  <StructureEntityTypeIcon
                    icon={type.icon}
                    className="text-muted-foreground"
                  />
                  {type.name}
                  <Combobox.Check checked={type._id === entity.typeId} />
                </Command.Item>
              ))}
              <Command.Item
                value="type-settings"
                onSelect={() => {
                  setOpen(false);
                  openTypeSettings(entity.typeId);
                }}
              >
                <IconSettings />
                {t('type-settings')}
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </span>
  );
};

export const StructureTypePill = ({
  entity,
  className,
}: {
  entity: TStructureTypePillEntity;
  className?: string;
}) => {
  const { typesById, canManage } = useStructureWorkspace();
  const editable =
    canManage && !!entity.parentId && !isStructureEntityArchived(entity);

  if (editable) {
    return <StructureTypePillMenu entity={entity} className={className} />;
  }

  return (
    <span
      className={cn(PILL_CLASS_NAME, className)}
      title={typesById.get(entity.typeId)?.name}
    >
      <StructureTypePillLabel type={typesById.get(entity.typeId)} />
    </span>
  );
};
