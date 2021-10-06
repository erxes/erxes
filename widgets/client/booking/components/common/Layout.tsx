import * as React from 'react';
import { IBooking } from '../../types';
import Navigation from '../common/Navigation';
type Props = {
    booking: IBooking;
  };

  
const Layout = (props: Props) =>  {

  return (
    <div >
      {/* <Navigation
        items={booking.categoryTree}
        parentId={booking.productCategoryId}
      /> */}
    </div>
  );
}

export default Layout;