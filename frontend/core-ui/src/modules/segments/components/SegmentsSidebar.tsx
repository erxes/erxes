import { cn, Sidebar, useQueryState } from 'erxes-ui';
import { useSegmentLabels } from 'ui-modules';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type Props = {
  types: { contentType: string; description: string }[];
  className?: string;
};

export const SegmentListSidebar = ({ types, className }: Props) => {
  const [selectedContentType] = useQueryState<string>('contentType');
  const { t } = useTranslation('segment');
  const { contentTypeLabel } = useSegmentLabels();

  return (
    <Sidebar.Panel
      className={cn('flex-none', className)}
      label={t('segment-types')}
    >
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {types.map(({ description, contentType }) => (
              <Sidebar.MenuItem key={contentType}>
                <Sidebar.MenuButton
                  isActive={contentType === selectedContentType}
                  asChild
                >
                  <Link to={`?contentType=${contentType}`}>
                    {contentTypeLabel(contentType, description)}
                  </Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Panel>
  );
};
