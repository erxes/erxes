import React from 'react';
import { InsuranceCategory, InsuranceProduct } from '../../../gql/types';
import Chip from '@erxes/ui/src/components/Chip';
import { SectionContainer } from '@erxes/ui/src/layout/styles';
import * as routerUtils from '@erxes/ui/src/utils/router';
import { FilterContainer } from '../../../styles';

type Props = {
  history: any;
  queryParams: any;
  categories: InsuranceCategory[];
  products: InsuranceProduct[];
  vendors: any[];
};

const Filters = (props: Props) => {
  const { queryParams } = props;
  //   const [filters, setFilters] = React.useState<any[]>([]);
  const [category, setCategory] = React.useState<any>(undefined);
  const [product, setProduct] = React.useState<any>(undefined);
  const [vendor, setVendor] = React.useState<any>(undefined);

  React.useEffect(() => {
    if (queryParams.category) {
      const category = props.categories.find(
        (category) => category._id === queryParams.category
      );

      if (category) {
        setCategory(category);
      }
    } else {
      setCategory(undefined);
    }

    if (queryParams.product) {
      const product = props.products.find(
        (product) => product._id === queryParams.product
      );

      if (product) {
        setProduct(product);
      }
    } else {
      setProduct(undefined);
    }

    if (queryParams.company) {
      const vendor = props.vendors.find(
        (vendor) => vendor.company._id === queryParams.company
      );
      
      if (vendor) {
        setVendor(vendor);
      }
    } else {
      setVendor(undefined);
    }
  }, [props.categories, props.products, props.vendors, queryParams, history]);

  const onRemove = (key: string) => {
    const { history } = props;

    routerUtils.removeParams(history, key);

    switch (key) {
      case 'category':
        setCategory(undefined);
        break;
      case 'product':
        setProduct(undefined);
        break;
      case 'company':
        setVendor(undefined);
        break;
      default:
        break;
    }
  };

  const renderCategory = () => {
    if (!category) {
      return null;
    }

    return (
      <Chip
        onClick={() => {
          onRemove('category');
        }}
      >
        {category.name}
      </Chip>
    );
  };

  const renderProduct = () => {
    if (!product) {
      return null;
    }

    return (
      <Chip
        onClick={() => {
          onRemove('product');
        }}
      >
        {product.name}
      </Chip>
    );
  };

  const renderVendor = () => {
    if (!vendor) {
      return null;
    }

    return (
      <Chip
        onClick={() => {
          onRemove('company');
        }}
      >
        {vendor.company.primaryName}
      </Chip>
    );
  };

  return (
    <FilterContainer>
      {renderCategory()}
      {renderProduct()}
      {renderVendor()}
    </FilterContainer>
  );
};

export default Filters;
