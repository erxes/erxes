import { BrandsEdit } from '@/settings/brands/components/BrandsEdit';
import { BrandsView } from '@/settings/brands/components/BrandsView';
import { PageContainer, useQueryState } from 'erxes-ui';

export function BrandsPage() {
  const [brandId] = useQueryState('brand_id');
  return (
    <PageContainer>
      <BrandsView />
      {!!brandId && <BrandsEdit />}
    </PageContainer>
  );
}
