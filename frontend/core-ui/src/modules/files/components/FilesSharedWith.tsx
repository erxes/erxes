import { IconHierarchy, IconWorld } from '@tabler/icons-react';
import { Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MembersInline } from 'ui-modules';
import { useFilesSharedWith } from '../hooks/useFilesSharedWith';

const GROUP_ICONS = {
  everyone: IconWorld,
  entity: IconHierarchy,
};

export const FilesSharedWith = ({
  sharedWith,
}: Parameters<typeof useFilesSharedWith>[0]) => {
  const { t } = useTranslation('files');
  const { memberIds, groups } = useFilesSharedWith({ sharedWith });

  if (!memberIds.length && !groups.length) {
    return null;
  }

  return (
    <span
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      {!!memberIds.length && (
        <MembersInline.Provider memberIds={memberIds} size="sm">
          <MembersInline.Avatar />
        </MembersInline.Provider>
      )}
      {groups.map(({ type, count }) => {
        const Icon = GROUP_ICONS[type];

        return (
          <Tooltip key={type} delayDuration={100}>
            <Tooltip.Trigger asChild>
              <span className="flex h-5 items-center gap-0.5 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
                <Icon className="size-3" />
                {type !== 'everyone' && count}
              </span>
            </Tooltip.Trigger>
            <Tooltip.Content>
              {type === 'everyone'
                ? t('principal-everyone')
                : t('shared-with-groups', {
                    count,
                    type: t(`principal-${type}`),
                  })}
            </Tooltip.Content>
          </Tooltip>
        );
      })}
    </span>
  );
};
