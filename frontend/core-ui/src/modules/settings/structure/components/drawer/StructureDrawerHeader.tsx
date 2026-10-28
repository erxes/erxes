import { IconChevronRight } from '@tabler/icons-react';
import { Badge, Button, Sheet } from 'erxes-ui';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useStructureWorkspace } from '../../contexts/StructureWorkspaceContext';
import { useStructureTypeDialogs } from '../../hooks/useStructureTypeDialogs';
import { IStructureEntityDetail } from '../../types/structureEntity';
import { isStructureEntityArchived } from '../../utils/structureEntityStatus';
import { StructureEntityTypeIcon } from '../StructureEntityTypeIcon';
import { StructureTypePill } from '../type-change/StructureTypePill';
import { StructureDrawerMenu } from './StructureDrawerMenu';
import { StructureDrawerTitle } from './StructureDrawerTitle';

export const StructureDrawerHeader = ({
  entity,
  editable,
}: {
  entity: IStructureEntityDetail;
  editable: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { select } = useStructureWorkspace();
  const { openTypeSettings } = useStructureTypeDialogs();
  const path = entity.path ?? [];

  return (
    <div className="flex flex-col gap-1 border-b bg-background px-3 pb-3 pt-2">
      <Sheet.Title className="sr-only">{entity.title}</Sheet.Title>
      <div className="flex min-h-7 items-center gap-1">
        <nav
          aria-label={t('path')}
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden text-xs text-muted-foreground"
        >
          {path.map((item, index) => (
            <Fragment key={item._id}>
              {index > 0 && <IconChevronRight className="size-3 shrink-0" />}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 min-w-0 shrink px-1 text-xs font-normal text-muted-foreground"
                onClick={() => select(item._id, { focus: true })}
              >
                <span className="truncate">{item.title}</span>
              </Button>
            </Fragment>
          ))}
        </nav>
        <StructureDrawerMenu entity={entity} />
        <Sheet.Close className="size-7" aria-label={t('close')} />
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 bg-primary/10 text-primary hover:bg-primary/20"
          aria-label={t('type-settings-of', { name: entity.type?.name ?? '' })}
          title={entity.type?.name}
          onClick={() => openTypeSettings(entity.typeId)}
        >
          <StructureEntityTypeIcon
            icon={entity.type?.icon}
            className="size-5"
          />
        </Button>
        <StructureDrawerTitle entity={entity} editable={editable} />
        <StructureTypePill entity={entity} className="shrink-0" />
        {isStructureEntityArchived(entity) && (
          <Badge variant="warning" className="shrink-0">
            {t('archived')}
          </Badge>
        )}
      </div>
    </div>
  );
};
