import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Messenger, Launcher, Notifier } from '../containers';

export default class App extends React.Component {
  componentDidMount() {
    // call save browser info mutation
    this.props.saveBrowserInfo();
  }

  render() {
    const { isMessengerVisible, isBrowserInfoSaved, uiOptions } = this.props;
    const widgetClasses = classNames('erxes-widget', { opened: isMessengerVisible });

    const renderNotifier = () => {
      if (isMessengerVisible) {
        return null;
      }

      if (!isBrowserInfoSaved) {
        return null;
      }

      return <Notifier />
    }

    const renderMessenger = () => {
      if (!isMessengerVisible) {
        return null;
      }

      if (!isBrowserInfoSaved) {
        return null;
      }

      return <Messenger />
    }

    return (
      <div className={widgetClasses}>
        {renderNotifier()}
        {renderMessenger()}
        <Launcher uiOptions={uiOptions} />
      </div>
    );
  }
}

App.propTypes = {
  isMessengerVisible: PropTypes.bool.isRequired,
  isBrowserInfoSaved: PropTypes.bool,
  uiOptions: PropTypes.object,
  saveBrowserInfo: PropTypes.func,
};

App.defaultProps = {
  uiOptions: null,
};
