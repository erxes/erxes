import * as React from "react";
import DumbApp from "../components/App";
import { connection } from "../connection";
import { AppConsumer, AppProvider } from "./AppContext";
import { postMessage, saveBrowserInfo } from "./utils";

type Props = {
  loadType: string;
  isPopupVisible: boolean;
  isFormVisible: boolean;
  isCalloutVisible: boolean;
  init: () => void;
  closePopup: () => void;
  showPopup: () => void;
  setHeight: () => void;
  setCallSubmit: (state: boolean) => void;
  setExtraContent: (content: string) => void;
};

class App extends React.Component<Props> {
  componentDidMount() {
    saveBrowserInfo();

    window.addEventListener("message", event => {
      const { fromPublisher, message, action, formId, html } = event.data;

      if (fromPublisher) {
        // receive sendingBrowserInfo command from publisher
        if (message === "sendingBrowserInfo") {
          this.props.init();
        }

        if (formId === connection.setting.form_id) {
          // receive show popup command from publisher
          if (action === "showPopup") {
            this.props.showPopup();
          }

          // receive call submit command
          if (action === "callSubmit") {
            this.props.setCallSubmit(true);
          }

          if (action === "extraFormContent") {
            this.props.setExtraContent(html);
          }
        }
      }
    });
  }

  componentDidUpdate() {
    this.props.setHeight();
  }

  render() {
    const {
      isPopupVisible,
      isFormVisible,
      isCalloutVisible,
      loadType
    } = this.props;

    let parentClass;
    let containerClass = "";

    const extendedProps = { ...this.props, containerClass };

    if (loadType === "popup") {
      if (isPopupVisible) {
        parentClass = "erxes-modal-iframe";
        containerClass = "modal-form open";
      } else {
        parentClass = "erxes-modal-iframe hidden";
        containerClass = "modal-form";
      }
    }

    if (loadType === "slideInLeft") {
      parentClass = "erxes-slide-left-iframe";
      containerClass = "container-slide-in-left";
    }

    if (loadType === "slideInRight") {
      parentClass = "erxes-slide-right-iframe";
      containerClass = "container-slide-in-right";
    }

    if (loadType === "dropdown") {
      parentClass = "erxes-dropdown-iframe";
      containerClass = "container-dropdown";

      if (isCalloutVisible) {
        containerClass += " call-out";
      }
    }

    if (loadType === "embedded") {
      parentClass = "erxes-embedded-iframe";
      containerClass = "container-embedded";
    }

    if (loadType === "shoutbox") {
      if (isCalloutVisible || isFormVisible) {
        parentClass = "erxes-shoutbox-iframe";
      } else {
        parentClass = "erxes-shoutbox-iframe erxes-hidden";
      }

      containerClass = "container-shoutbox";
    }

    postMessage({
      message: "changeContainerClass",
      className: parentClass
    });

    extendedProps.containerClass = containerClass;

    return <DumbApp {...extendedProps} />;
  }
}

const WithContext = () => (
  <AppProvider>
    <AppConsumer>
      {value => {
        const {
          init,
          closePopup,
          showPopup,
          isPopupVisible,
          isFormVisible,
          isCalloutVisible,
          setHeight,
          getIntegrationConfigs,
          setCallSubmit,
          setExtraContent
        } = value;

        return (
          <App
            loadType={getIntegrationConfigs().loadType}
            isPopupVisible={isPopupVisible}
            isFormVisible={isFormVisible}
            isCalloutVisible={isCalloutVisible}
            init={init}
            setCallSubmit={setCallSubmit}
            setExtraContent={setExtraContent}
            setHeight={setHeight}
            closePopup={closePopup}
            showPopup={showPopup}
          />
        );
      }}
    </AppConsumer>
  </AppProvider>
);

export default WithContext;
