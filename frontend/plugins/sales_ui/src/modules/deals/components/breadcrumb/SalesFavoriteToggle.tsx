import { Breadcrumb } from 'erxes-ui';
import { FavoriteToggleIconButton } from 'ui-modules';

export const SalesFavoriteToggle = ({
  breadcrumb,
}: {
  breadcrumb: string[];
}) => {
  return (
    <Breadcrumb.Item className="ml-1">
      <FavoriteToggleIconButton breadcrumb={breadcrumb} />
    </Breadcrumb.Item>
  );
};
