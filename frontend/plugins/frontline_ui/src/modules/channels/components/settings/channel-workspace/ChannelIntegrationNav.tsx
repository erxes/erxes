import { ChannelWorkspaceNavCount } from '@/channels/components/settings/channel-workspace/ChannelWorkspaceNavCount';
import { TChannelIntegrationKind } from '@/channels/utils/groupIntegrationKinds';
import { IntegrationNavLink } from '@/integrations/components/IntegrationNavLink';
import { Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const SKELETON_ROWS = 3;

const ChannelIntegrationNavItem = ({
  basePath,
  kind,
}: {
  basePath: string;
  kind: TChannelIntegrationKind;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });

  return (
    <IntegrationNavLink
      basePath={basePath}
      path={kind.type}
      name={kind.name}
      img={kind.img}
    >
      {kind.needsAttention && (
        <span
          role="img"
          aria-label={t('integration-needs-attention', 'Needs attention')}
          className="size-1.5 shrink-0 rounded-full bg-destructive"
        />
      )}
      {kind.count > 0 && <ChannelWorkspaceNavCount value={kind.count} />}
    </IntegrationNavLink>
  );
};

export const ChannelIntegrationNavGroup = ({
  basePath,
  label,
  kinds,
  loading,
}: {
  basePath: string;
  label: string;
  kinds: TChannelIntegrationKind[];
  loading?: boolean;
}) => {
  if (!loading && kinds.length === 0) return null;

  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel>{label}</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {loading
            ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <Sidebar.MenuItem key={index}>
                  <Sidebar.MenuSkeleton showIcon />
                </Sidebar.MenuItem>
              ))
            : kinds.map((kind) => (
                <ChannelIntegrationNavItem
                  key={kind.type}
                  basePath={basePath}
                  kind={kind}
                />
              ))}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
