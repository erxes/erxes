import * as React from 'react';
import { App as DumbApp } from '../components';
import { AppConsumer, AppProvider } from './AppContext';
import { connection } from '../connection';
import { saveBrowserInfo } from './utils';
import { connection as formConnection } from '../../form/connection';
import { IIntegration } from '../../types';
import { setLocale } from '../../utils';

type Props = {
  isPopupVisible: boolean;
  activeRoute: string;
  isFormVisible: boolean;
  closePopup: () => void;
  integration: IIntegration;
  showPopup: () => void;
};

class AppContainer extends React.Component<
  Props,
  { isTransationsLoaded: boolean }
> {
  constructor(props: Props) {
    super(props);

    this.state = { isTransationsLoaded: false };
  }

  componentDidMount() {
    saveBrowserInfo();

    setLocale(connection.data.integration.languageCode, () => {
      this.setState({ isTransationsLoaded: true });
    });
  }

  render() {
    const { isTransationsLoaded } = this.state;

    if (!isTransationsLoaded) {
      return null;
    }

    const { isPopupVisible, integration } = this.props;

    const booking = integration.bookingData || {};
    connection.data.booking = booking;
    formConnection.data.form = integration.formId;

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
      ...this.props,
      booking,
      containerClass
    };

    return <DumbApp {...extendedProps} />;
  }
}

const WithContext = () => {
  return (
    <AppProvider>
      <AppConsumer>
        {({
          activeRoute,
          isFormVisible,
          showPopup,
          closePopup,
          isPopupVisible,
          getIntegration
        }) => {
          const integration = getIntegration();
          return (
            <AppContainer
              activeRoute={activeRoute}
              isFormVisible={isFormVisible}
              showPopup={showPopup}
              closePopup={closePopup}
              isPopupVisible={isPopupVisible}
              integration={integration}
            />
          );
        }}
      </AppConsumer>
    </AppProvider>
  );
};

export default WithContext;
