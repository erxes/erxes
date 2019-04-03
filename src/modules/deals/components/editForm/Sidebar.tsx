import { Button } from 'modules/common/components';
import { CompanySection } from 'modules/companies/components';
import { ICompany } from 'modules/companies/types';
import { CustomerSection } from 'modules/customers/components/common';
import { ICustomer } from 'modules/customers/types';
import { IProduct } from 'modules/settings/productService/types';
import * as React from 'react';
import { ProductSection } from '../';
import { RightContent } from '../../styles/deal';
import { IDeal, IProductData } from '../../types';

type Props = {
  deal: IDeal;
  customers: ICustomer[];
  companies: ICompany[];
  products: IProduct[];
  productsData: IProductData[];
  onChangeField?: (
    name: 'productsData' | 'products' | 'companies' | 'customers',
    value: any
  ) => void;
  copyDeal: () => void;
  removeDeal: (dealId: string) => void;
  saveProductsData: () => void;
};

class Sidebar extends React.Component<Props> {
  render() {
    const {
      customers,
      companies,
      products,
      productsData,
      deal,
      onChangeField,
      saveProductsData,
      copyDeal,
      removeDeal
    } = this.props;

    const onChange = (type, value) => {
      if (onChangeField) {
        onChangeField(type, value);
      }
    };

    const pDataChange = pData => onChange('productsData', pData);
    const prsChange = prs => onChange('products', prs);
    const cmpsChange = cmps => onChange('companies', cmps);
    const cmrsChange = cmrs => onChange('customers', cmrs);
    const onClick = () => removeDeal(deal._id);

    return (
      <RightContent>
        <ProductSection
          onChangeProductsData={pDataChange}
          onChangeProducts={prsChange}
          productsData={productsData}
          products={products}
          saveProductsData={saveProductsData}
        />

        <CompanySection
          name="Deal"
          companies={companies}
          onSelect={cmpsChange}
        />

        <CustomerSection
          name="Deal"
          customers={customers}
          onSelect={cmrsChange}
        />

        <Button icon="checked-1" onClick={copyDeal}>
          Copy
        </Button>

        <Button icon="cancel-1" onClick={onClick}>
          Delete
        </Button>
      </RightContent>
    );
  }
}

export default Sidebar;
