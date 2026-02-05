import { useProductFieldTypes } from '@/products/constants/productFieldTypes';
import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { IProductType } from '@/products/types/productTypes';

export const ProductSidebar = () => {
  const productFieldTypes = useProductFieldTypes();
  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupLabel>Products types</Sidebar.GroupLabel>
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
