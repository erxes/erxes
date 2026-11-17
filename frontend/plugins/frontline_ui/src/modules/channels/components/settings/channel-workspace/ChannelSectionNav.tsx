import { ChannelWorkspaceNavCount } from '@/channels/components/settings/channel-workspace/ChannelWorkspaceNavCount';
import { TChannelSection } from '@/channels/constants/channelSections';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export const ChannelSectionNav = ({
  sections,
  basePath,
  counts,
  rootSegment,
}: {
  sections: readonly TChannelSection[];
  basePath: string;
  counts?: Partial<Record<string, number>>;
  rootSegment?: string;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { pathname } = useLocation();
  const isRoot = pathname.replace(/\/$/, '') === `/${basePath}`;

  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel>{t('channel', 'Channel')}</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {sections.map(({ segment, labelKey, defaultLabel, icon }) => {
            const name = t(labelKey, defaultLabel);

            return (
              <NavigationMenuLinkItem
                key={segment}
                pathPrefix={basePath}
                path={segment}
                name={name}
                icon={icon}
                isActive={isRoot && segment === rootSegment}
                label={<span className="min-w-0 flex-1 truncate">{name}</span>}
              >
                <ChannelWorkspaceNavCount value={counts?.[segment]} />
              </NavigationMenuLinkItem>
            );
          })}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
