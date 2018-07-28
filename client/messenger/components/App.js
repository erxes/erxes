import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as classNames from 'classnames';
import { Messenger, Launcher } from '../containers';

export default class App extends React.Component {
  componentDidMount() {
    // call save browser info mutation
    this.props.saveBrowserInfo();
  }

  render() {
    const { isMessengerVisible } = this.props;
    const widgetClasses = classNames('erxes-widget', { opened: isMessengerVisible });

    return (
      <div className={widgetClasses}>
        {isMessengerVisible && <Messenger />}
        <Launcher />
      </div>
    );
  }
}

App.propTypes = {
  isMessengerVisible: PropTypes.bool.isRequired,
  saveBrowserInfo: PropTypes.func,
};
