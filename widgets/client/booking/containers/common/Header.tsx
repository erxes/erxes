import * as React from 'react';
import { AppConsumer } from '../AppContext';
import Header from '../../components/common/Header';
import { IBookingData, ICategoryTree } from '../../types';
import { ChildProps } from 'react-apollo';

type Props = {
  items: ICategoryTree[];
  parentId?: string;
  goToCategory?: (categoryId: string) => void;
  goToProduct?: (productId: string) => void;
  booking?: IBookingData;
  selectedItem?: string;
};

function HeaderContainer(props: ChildProps<Props>) {
  const { goToCategory, goToProduct } = props;

  const changeRoute = (item: ICategoryTree) => {
    if (item.type === 'category' && goToCategory) {
      return goToCategory(item._id);
    }

    if (item.type === 'product' && goToProduct) {
      return goToProduct(item._id);
    }
  };
  return <Header {...props} changeRoute={changeRoute} />;
}

const WithContext = (props: Props) => {
  return (
    <AppConsumer>
      {({ goToCategory, goToProduct, getBooking, selectedItem }) => {
        const booking = getBooking();
        return (
          <HeaderContainer
            {...props}
            goToCategory={goToCategory}
            goToProduct={goToProduct}
            booking={booking}
            selectedItem={selectedItem}
          />
        );
      }}
    </AppConsumer>
  );
};

export default WithContext;
