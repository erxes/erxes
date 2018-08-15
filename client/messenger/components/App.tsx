import * as classNames from "classnames";
import * as React from "react";
import { Launcher, Messenger } from "../containers";

type Props = {
  isMessengerVisible: boolean;
  saveBrowserInfo: () => void;
};

export default class App extends React.Component<Props> {
  componentDidMount() {
    // call save browser info mutation
    this.props.saveBrowserInfo();
  }

  render() {
    const { isMessengerVisible } = this.props;
    const widgetClasses = classNames("erxes-widget", {
      opened: isMessengerVisible
    });

    return (
      <div className={widgetClasses}>
        {isMessengerVisible && (
          <div className="erxes-messenger appear-scale-in">
            <Messenger />
          </div>
        )}
        <Launcher />
      </div>
    );
  }
}
