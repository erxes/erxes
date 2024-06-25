import * as React from 'react';
import { useAppContext } from '../AppContext';
import Header from '../../components/common/Header';
import { ICategoryTree } from '../../types';

function HeaderContainer() {
  const { goToCategory, goToProduct, goToIntro, getBooking, selectedItem } =
    useAppContext();

  const booking = getBooking();

  const changeRoute = (treeItem: ICategoryTree) => {
    if (treeItem.type === 'category' && goToCategory) {
      return goToCategory(treeItem._id);
    }

    if (treeItem.type === 'product' && goToProduct) {
      return goToProduct(treeItem._id);
    }
  };

  const extendedProps = {
    goToCategory,
    goToProduct,
    goToIntro,
    booking,
    selectedItem,
    changeRoute,
    items: [],
  };
  return <Header {...extendedProps} />;
}

export default HeaderContainer;
