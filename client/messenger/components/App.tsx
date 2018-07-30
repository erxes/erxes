import * as React from 'react';
import * as classNames from 'classnames';
import { Messenger, Launcher } from '../containers';

type Props = {
  isMessengerVisible: boolean,
  saveBrowserInfo: () => void,
};

export default class App extends React.Component<Props> {
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