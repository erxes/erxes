import { IconAlertTriangle, IconHierarchy } from '@tabler/icons-react';
import { ScrollArea, Sheet, Spinner } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useStructureWorkspace } from '../../contexts/StructureWorkspaceContext';
import { useStructureEntityDetail } from '../../hooks/useStructureEntityDetail';
import { STRUCTURE_DROP_BLOCKER_PROPS } from '../../hooks/useStructureDnd';
import { useStructureEscape } from '../../hooks/useStructureEscape';
import { IStructureEntityDetail } from '../../types/structureEntity';
import { isStructureEntityArchived } from '../../utils/structureEntityStatus';
import { StructureEmpty } from '../StructureEmpty';
import { StructureDrawerHeader } from './StructureDrawerHeader';
import { StructureDrawerPeople } from './StructureDrawerPeople';
import { StructureDrawerProperties } from './StructureDrawerProperties';
import { StructureDrawerSeats } from './StructureDrawerSeats';

const StructureDrawerBody = ({
  entity,
}: {
  entity: IStructureEntityDetail;
}) => {
  const { canManage } = useStructureWorkspace();
  const editable = canManage && !isStructureEntityArchived(entity);

  return (
    <>
      <StructureDrawerHeader entity={entity} editable={editable} />
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-6 p-4">
          <StructureDrawerProperties entity={entity} editable={editable} />
          <StructureDrawerSeats entity={entity} editable={editable} />
          <StructureDrawerPeople entity={entity} editable={editable} />
        </div>
      </ScrollArea>
    </>
  );
};

const StructureDrawerState = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <>
      <div className="flex justify-end border-b px-3 py-2">
        <Sheet.Title className="sr-only">{t('structure')}</Sheet.Title>
        <Sheet.Close className="size-7" aria-label={t('close')} />
      </div>
      {children}
    </>
  );
};

export const StructureDrawer = ({
  entityId,
  onClose,
}: {
  entityId: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { entity, loading, error } = useStructureEntityDetail(entityId);

  useStructureEscape(onClose);

  const renderContent = () => {
    if (loading) {
      return (
        <StructureDrawerState>
          <Spinner containerClassName="py-20" />
        </StructureDrawerState>
      );
    }

    if (error) {
      return (
        <StructureDrawerState>
          <StructureEmpty
            icon={IconAlertTriangle}
            title={t('node-load-failed')}
            description={error.message}
          />
        </StructureDrawerState>
      );
    }

    if (!entity) {
      return (
        <StructureDrawerState>
          <StructureEmpty icon={IconHierarchy} title={t('node-not-found')} />
        </StructureDrawerState>
      );
    }

    return <StructureDrawerBody key={entity._id} entity={entity} />;
  };

  return (
    <Sheet open modal={false} onOpenChange={(open) => !open && onClose()}>
      <aside
        {...STRUCTURE_DROP_BLOCKER_PROPS}
        className="absolute inset-y-2 right-2 z-20 flex w-[28rem] max-w-[calc(100%-1rem)] flex-col overflow-hidden rounded-md border bg-background shadow-lg duration-200 animate-in fade-in-0 slide-in-from-right-8"
      >
        {renderContent()}
      </aside>
    </Sheet>
  );
};
