import * as React from "react";
import { iconClose } from "../../icons/Icons";
import { Callout, Form, ShoutboxLauncher } from "../containers";

type Props = {
  isFormVisible: boolean;
  isCalloutVisible: boolean;
  containerClass: string;
  closePopup: () => void;
  loadType: string;
};

class App extends React.Component<Props> {
  renderCloseButton() {
    const { loadType, closePopup } = this.props;

    if (loadType === "shoutbox") {
      return null;
    }

    return (
      <a className="close" onClick={closePopup} title="Close">
        {iconClose()}
      </a>
    );
  }

  renderForm() {
    const { isFormVisible } = this.props;

    if (isFormVisible) {
      return <Form />;
    }

    return null;
  }

  renderCallout() {
    const { isCalloutVisible } = this.props;

    if (isCalloutVisible) {
      return <Callout />;
    }

    return null;
  }

  renderShoutboxLauncher() {
    const { loadType } = this.props;

    if (loadType === "shoutbox") {
      return <ShoutboxLauncher />;
    }

    return null;
  }

  render() {
    const { containerClass } = this.props;

    return (
      <div id="erxes-container">
        <div className={containerClass}>
          {this.renderCloseButton()}
          {this.renderCallout()}
          {this.renderForm()}
          {this.renderShoutboxLauncher()}
        </div>
      </div>
    );
  }
}

export default App;
