import React from 'react';
import PropTypes from 'prop-types';
import { CompanySection } from 'modules/companies/components';
import { CustomerSection } from 'modules/customers/components';
import { Button } from 'modules/common/components';
import { ProductSection } from '../../';
import { Right } from '../../../styles/deal';

const propTypes = {
  deal: PropTypes.object.isRequired,
  customers: PropTypes.array,
  companies: PropTypes.array,
  products: PropTypes.array,
  productsData: PropTypes.array,
  onChangeField: PropTypes.func,
  removeDeal: PropTypes.func,
  saveProductsData: PropTypes.func
};

class Sidebar extends React.Component {
  render() {
    const {
      customers,
      companies,
      products,
      productsData,
      deal,
      onChangeField,
      saveProductsData,
      removeDeal
    } = this.props;

    return (
      <Right>
        <ProductSection
          onChangeProductsData={productsData =>
            onChangeField('productsData', productsData)
          }
          onChangeProducts={products => onChangeField('products', products)}
          productsData={productsData}
          products={products}
          saveProductsData={saveProductsData}
        />

        <CompanySection
          name="Deal"
          companies={companies}
          onSelect={companies => onChangeField('companies', companies)}
        />

        <CustomerSection
          name="Deal"
          customers={customers}
          onSelect={customers => onChangeField('customers', customers)}
        />

        <Button onClick={this.copy} icon="checked-1">
          Copy
        </Button>

        <Button icon="cancel-1" onClick={() => removeDeal(deal._id)}>
          Delete
        </Button>
      </Right>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
