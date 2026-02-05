import { cn, Sidebar, useQueryState } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type Props = {
  types: { contentType: string; description: string }[];
  className?: string;
};

export const SegmentListSidebar = ({ types, className }: Props) => {
  const [selectedContentType] = useQueryState<string>('contentType');
  const { t } = useTranslation('segment');

  return (
    <Sidebar collapsible="none" className={cn('flex-none', className)}>
      <Sidebar.Group>
        <Sidebar.GroupLabel>{t('segment-types')}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {types.map(({ description, contentType }) => (
              <Sidebar.MenuItem key={contentType}>
                <Sidebar.MenuButton
                  isActive={contentType === selectedContentType}
                  asChild
                >
                  <Link to={`?contentType=${contentType}`}>{description}</Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
