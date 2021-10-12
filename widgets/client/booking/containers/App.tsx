import * as React from 'react';
import { App as DumbApp } from '../components';
import { AppConsumer, AppProvider } from './AppContext';
import { ChildProps, graphql, compose } from 'react-apollo';
import { connection } from '../connection';
import gql from 'graphql-tag';
import { bookingDetail } from '../graphql';
import { IBooking } from '../types';

type QueryResponse = {
  widgetsBookingDetail: IBooking;
};

type Props = {
  isPopupVisible: boolean;
  activeRoute: string;
  isFormVisible: boolean;
  closePopup: () => void;
};

function AppContainer(props: ChildProps<Props, QueryResponse>) {
  const { data, isPopupVisible } = props;

  if (!data || data.loading || !data.widgetsBookingDetail) {
    return null;
  }

  const booking = data.widgetsBookingDetail;
  connection.data.booking = booking;

  const loadType = 'popup';

  let parentClass;
  let containerClass = '';

  if (loadType) {
    if (isPopupVisible) {
      parentClass = 'erxes-modal-iframe';
      containerClass = 'modal-form open';
    } else {
      parentClass = 'erxes-modal-iframe hidden';
    }
  }

  const extendedProps = {
    ...props,
    booking,
    containerClass
  };

  return <DumbApp {...extendedProps} />;
}

const WithData = compose(
  graphql<{}, QueryResponse>(gql(bookingDetail), {
    options: () => ({
      variables: {
        _id: connection.setting.booking_id
      }
    })
  })
)(AppContainer);

const WithContext = () => {
  return (
    <AppProvider>
      <AppConsumer>
        {({
          activeRoute,
          isFormVisible,
          showPopup,
          closePopup,
          isPopupVisible
        }) => {
          return (
            <WithData
              activeRoute={activeRoute}
              isFormVisible={isFormVisible}
              showPopup={showPopup}
              closePopup={closePopup}
              isPopupVisible={isPopupVisible}
            />
          );
        }}
      </AppConsumer>
    </AppProvider>
  );
};

export default WithContext;
