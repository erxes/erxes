import { Badge, RecordTableInlineCell, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { StructureEntityBadge } from 'ui-modules';
import { IUserStructureMembership } from '@/settings/team-member/types';

export const TeamMemberStructureCell = ({
  memberships = [],
}: {
  memberships?: IUserStructureMembership[];
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [primary, ...others] = memberships;

  if (!primary) {
    return (
      <RecordTableInlineCell>
        <span className="text-muted-foreground">{t('not-placed')}</span>
      </RecordTableInlineCell>
    );
  }

  return (
    <RecordTableInlineCell className="gap-1">
      <StructureEntityBadge
        entity={primary.entity}
        entityId={primary.entityId}
        showMissingId
        variant="secondary"
        className="min-w-0"
      />
      {others.length > 0 && (
        <Tooltip.Provider>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Badge variant="secondary" className="shrink-0">
                +{others.length}
              </Badge>
            </Tooltip.Trigger>
            <Tooltip.Content>
              {others
                .map(({ entity, entityId }) => entity?.title || entityId)
                .join(', ')}
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
      )}
    </RecordTableInlineCell>
  );
};
