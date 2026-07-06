import { Breadcrumb } from 'erxes-ui';
import { FavoriteToggleIconButton } from 'ui-modules';

export const SalesFavoriteToggle = ({
  breadcrumb,
  icon,
}: {
  breadcrumb: string[];
  icon: string;
}) => {
  return (
    <Breadcrumb.Item className="ml-1">
      <FavoriteToggleIconButton breadcrumb={breadcrumb} icon={icon} />
    </Breadcrumb.Item>
  );
};
