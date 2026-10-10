import { useQuery } from '@apollo/client';
import { cn, NavigationMenuGroup, Sidebar, useQueryState } from 'erxes-ui';
import { SEGMENTS_GET_TYPES, useSegmentLabels } from 'ui-modules';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type TSegmentType = { contentType: string; description: string };

const SegmentTypeMenuItem = ({ contentType, description }: TSegmentType) => {
  const [selectedContentType] = useQueryState<string>('contentType');
  const { contentTypeLabel } = useSegmentLabels();

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton
        isActive={contentType === selectedContentType}
        asChild
      >
        <Link to={`?contentType=${contentType}`}>
          <span className="min-w-0 flex-1 truncate">
            {contentTypeLabel(contentType, description)}
          </span>
        </Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};

export const SegmentsContextNavigation = () => {
  const { data, loading } = useQuery(SEGMENTS_GET_TYPES);
  const { t } = useTranslation('segment');
  const types: TSegmentType[] = data?.segmentsGetTypes || [];

  return (
    <NavigationMenuGroup name={t('segment-types')}>
      {loading && !types.length ? (
        <>
          <Sidebar.MenuSkeleton />
          <Sidebar.MenuSkeleton />
          <Sidebar.MenuSkeleton />
        </>
      ) : (
        types.map((type) => (
          <SegmentTypeMenuItem key={type.contentType} {...type} />
        ))
      )}
    </NavigationMenuGroup>
  );
};

export const SegmentListSidebar = ({
  types,
  className,
}: {
  types: TSegmentType[];
  className?: string;
}) => {
  const { t } = useTranslation('segment');

  return (
    <Sidebar.Panel
      className={cn('flex-none', className)}
      label={t('segment-types')}
    >
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {types.map((type) => (
              <SegmentTypeMenuItem key={type.contentType} {...type} />
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Panel>
  );
};
