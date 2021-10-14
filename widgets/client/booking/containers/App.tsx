import * as React from 'react';
import { App as DumbApp } from '../components';
import { AppConsumer, AppProvider } from './AppContext';
import { ChildProps, graphql, compose } from 'react-apollo';
import { connection } from '../connection';
import gql from 'graphql-tag';
import { bookingDetail, integrationDetailQuery } from '../graphql';
import { IBooking } from '../types';
import { saveBrowserInfo } from '../../form/containers/utils';

type QueryResponse = {
  widgetsIntegrationDetail: any;
};

type Props = {
  isPopupVisible: boolean;
  activeRoute: string;
  isFormVisible: boolean;
  closePopup: () => void;
};

function AppContainer(props: ChildProps<Props, QueryResponse>) {
  saveBrowserInfo();

  const { data, isPopupVisible } = props;

  if (!data || data.loading || !data.widgetsIntegrationDetail) {
    return null;
  }

  const integration = data.widgetsIntegrationDetail;
  const booking = integration.bookingData || {};
  connection.data.booking = booking;
  connection.data.integration = integration;

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
  graphql<{}, QueryResponse>(gql(integrationDetailQuery), {
    options: () => ({
      variables: {
        _id: connection.setting.integration_id
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
