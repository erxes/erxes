import { useProductFieldTypes } from '@/products/constants/productFieldTypes';
import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IProductType } from '@/products/types/productTypes';

export const ProductSidebar = () => {
  const { t } = useTranslation('product');
  const productFieldTypes = useProductFieldTypes();
  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupLabel>
          {t('products-types', 'Products types')}
        </Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {productFieldTypes.map((productType) => (
              <Sidebar.MenuItem key={productType.value}>
                <ProductMenuItem productType={productType} />
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

const ProductMenuItem = ({ productType }: { productType: IProductType }) => {
  const location = useLocation();
  const isActive = location.pathname === productType.value;

  return (
    <Sidebar.MenuButton isActive={isActive} asChild>
      <Link to={productType.value}>{productType.label}</Link>
    </Sidebar.MenuButton>
  );
};
