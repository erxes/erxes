import React from 'react';
import PropTypes from 'prop-types';
import { App as DumbApp } from '../components';
import { connection } from '../connection';
import { AppProvider, AppConsumer } from './AppContext';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.setHeight = this.setHeight.bind(this);
  }

  componentDidMount() {
    this.props.saveBrowserInfo();

    window.addEventListener('message', (event) => {
      if (event.data.fromPublisher) {
        // receive show popup command from publisher
        if (event.data.action === 'showPopup') {
          this.props.showPopup();
        }
      }
    });
  }

  setHeight() {
    const elementsHeight = document.getElementById('erxes-container').clientHeight;

    this.props.postMessage({
      message: 'changeContainerStyle',
      style: `height: ${elementsHeight}px;`,
    });
  }

  componentDidUpdate() {
    this.setHeight();
  }

  render() {
    const { postMessage, isPopupVisible, isFormVisible, isCalloutVisible, formData } = this.props;
    const { loadType } = formData;

    const extendedProps = { ...this.props, setHeight: this.setHeight };

    let parentClass;
    let containerClass;

    if (loadType === 'popup') {
      if (isPopupVisible) {
        parentClass = 'erxes-modal-iframe';
        containerClass = 'modal-form open';
      } else {
        parentClass = 'erxes-modal-iframe hidden';
        containerClass = 'modal-form';
      }
    }

    if (loadType === 'slideInLeft') {
      parentClass = 'erxes-slide-left-iframe';
      containerClass = 'container-slide-in-left';
    }

    if (loadType === 'slideInRight') {
      parentClass = 'erxes-slide-right-iframe';
      containerClass = 'container-slide-in-right';
    }

    if (loadType === 'dropdown') {
      parentClass = 'erxes-dropdown-iframe';
      containerClass = 'container-dropdown';

      if (isCalloutVisible) {
        containerClass += ' call-out';
      }
    }

    if (loadType === 'embedded') {
      parentClass = 'erxes-embedded-iframe';
      containerClass = 'container-embedded';
    }

    if (loadType === 'shoutbox') {
      if (isCalloutVisible || isFormVisible) {
        parentClass = 'erxes-shoutbox-iframe';
      } else {
        parentClass = 'erxes-shoutbox-iframe erxes-hidden';
      }

      containerClass = 'container-shoutbox';
    }

    postMessage({
      message: 'changeContainerClass',
      className: parentClass,
    });

    extendedProps.containerClass = containerClass;

    return <DumbApp {...extendedProps} />;
  }
}

App.propTypes = {
  postMessage: PropTypes.func,
  formData: PropTypes.object,
  isPopupVisible: PropTypes.bool,
  isFormVisible: PropTypes.bool,
  isCalloutVisible: PropTypes.bool,
  saveBrowserInfo: PropTypes.func,
  showPopup: PropTypes.func,
}

const WithContext = (props) => (
  <AppProvider>
    <AppConsumer>
      {(value) => {
        const {
          init, saveBrowserInfo, closePopup, showPopup,
          isPopupVisible, isFormVisible, postMessage,
          isCalloutVisible, currentStatus
        } = value;

        return <App
          {...props}
          formData={connection.data.formData}
          init={init}
          postMessage={postMessage}
          saveBrowserInfo={saveBrowserInfo}
          closePopup={closePopup}
          showPopup={showPopup}
          isPopupVisible={isPopupVisible}
          isFormVisible={isFormVisible}
          isCalloutVisible={isCalloutVisible}
          currentStatus={currentStatus}
        />
      }}
    </AppConsumer>
  </AppProvider>
)

export default WithContext;
