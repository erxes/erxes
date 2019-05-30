import { Button } from 'modules/common/components';
import { CompanySection } from 'modules/companies/components';
import { ICompany } from 'modules/companies/types';
import { CustomerSection } from 'modules/customers/components/common';
import { ICustomer } from 'modules/customers/types';
import { IProduct } from 'modules/settings/productService/types';
import * as React from 'react';
import { ProductSection } from '../../../deals/components';
import { RightContent } from '../../../deals/styles/deal';
import { IProductData } from '../../../deals/types';
import { Item } from '../../types';

type Props = {
  type: string;
  item: Item;
  customers: ICustomer[];
  companies: ICompany[];
  products: IProduct[];
  productsData: IProductData[];
  onChangeField?: (
    name: 'productsData' | 'products' | 'companies' | 'customers',
    value: any
  ) => void;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  saveProductsData: () => void;
};

class Sidebar extends React.Component<Props> {
  onChange = (type, value) => {
    const { onChangeField } = this.props;

    if (onChangeField) {
      onChangeField(type, value);
    }
  };

  renderProductSection() {
    if (this.props.type !== 'deal') {
      return null;
    }

    const { products, productsData, saveProductsData } = this.props;

    const pDataChange = pData => this.onChange('productsData', pData);
    const prsChange = prs => this.onChange('products', prs);

    return (
      <ProductSection
        onChangeProductsData={pDataChange}
        onChangeProducts={prsChange}
        productsData={productsData}
        products={products}
        saveProductsData={saveProductsData}
      />
    );
  }

  render() {
    const { customers, companies, item, copyItem, removeItem } = this.props;

    const cmpsChange = cmps => this.onChange('companies', cmps);
    const cmrsChange = cmrs => this.onChange('customers', cmrs);
    const onClick = () => removeItem(item._id);

    return (
      <RightContent>
        {this.renderProductSection()}

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

        <Button icon="checked-1" onClick={copyItem}>
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
