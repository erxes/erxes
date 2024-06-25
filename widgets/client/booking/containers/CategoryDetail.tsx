import * as React from 'react';
import CategoryDetail from '../components/CategoryDetail';
import { useQuery } from '@apollo/react-hooks';
import { GET_PRODUCT_CATEGORY } from '../graphql';
import { IProductCategory } from '../../types';
import { useAppContext } from './AppContext';

type QueryResponse = {
  widgetsProductCategory: IProductCategory;
};

function CategoryDetailContainer() {
  const { activeCategory, goToBookings, goToCategory, goToProduct, goToIntro } =
    useAppContext();

  const { data, loading } = useQuery(GET_PRODUCT_CATEGORY, {
    variables: {
      _id: activeCategory,
    },
  });

  if (!data || loading) {
    return null;
  }

  const extendedProps = {
    goToBookings,
    goToCategory,
    goToProduct,
    goToIntro,
    category: data.widgetsProductCategory,
  };

  return <CategoryDetail {...extendedProps} />;
}

export default CategoryDetailContainer;
