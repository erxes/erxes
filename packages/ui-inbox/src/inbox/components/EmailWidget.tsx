import {
  Link,
  NewEmailHeader,
  WidgetButton,
} from "@erxes/ui-inbox/src/settings/integrations/components/mail/styles";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import CommonPortal from "@erxes/ui/src/components/CommonPortal";
import Icon from "@erxes/ui/src/components/Icon";
import MailForm from "@erxes/ui-inbox/src/settings/integrations/containers/mail/MailForm";
import { ModalWrapper } from "../styles";
import Tip from "@erxes/ui/src/components/Tip";
import { WidgetWrapper } from "@erxes/ui-inbox/src/settings/integrations/components/mail/styles";
import { __ } from "@erxes/ui/src/utils";

type Props = {
  disabled?: boolean;
  emailTo?: string;
  buttonStyle?: string;
  buttonText?: string;
  customerId?: string;
  buttonSize?: string;
  type?: string;
  emailStatus?: () => void;
};

type State = {
  shrink: string;
  clear: boolean;
  isFullscreen: boolean;
  isEmptyEmail: boolean;
};

const Widget: React.FC<Props> = (props) => {
  const [state, setState] = useState<State>({
    shrink: localStorage.getItem("emailWidgetShrink") || "false",
    clear: false,
    isFullscreen: false,
    isEmptyEmail: false,
  });

  const changeState = (state: boolean) => {
    setState((prevState) => ({
      ...prevState,
      shrink: "false",
      clear: false,
    }));

    localStorage.setItem(
      "emailWidgetShow",
      JSON.stringify({
        type: props.type || "widget",
        show: state,
      })
    );
    localStorage.setItem("emailWidgetShrink", "false");
  };

  const showWidget = (isEmptyEmail?: boolean) => {
    const storageShow = JSON.parse(
      localStorage.getItem("emailWidgetShow") || "{}"
    );
    const storageWidgetShow = storageShow ? storageShow.show : false;

    if (storageWidgetShow === false) {
      changeState(true);
    }
    if (storageWidgetShow === true && storageShow.type === props.type) {
      changeState(false);
    }

    if (isEmptyEmail) {
      setState((prevState) => ({
        ...prevState,
        isEmptyEmail: true,
      }));
    }
  };

  const renderTrigger = () => {
    const {
      type = "widget",
      disabled,
      emailTo,
      buttonStyle,
      buttonText,
      buttonSize,
      emailStatus,
    } = props;

    if (type === "action" || type === "tab") {
      return (
        <Button
          btnStyle={buttonStyle ? buttonStyle : "primary"}
          onClick={() => showWidget()}
          disabled={disabled}
          size={buttonSize}
        >
          <Tip text="Send e-mail" placement="top-end">
            <Icon icon="envelope-alt" />
          </Tip>
          {buttonText && buttonText}
        </Button>
      );
    }

    if (type.includes("link")) {
      return (
        <Link onClick={() => showWidget()}>
          {emailTo}
          {(emailStatus && emailStatus()) || null}
        </Link>
      );
    }

    return (
      <WidgetButton>
        <Tip text={__("New Email")} placement="bottom">
          <Icon
            icon="envelope-alt"
            size={20}
            onClick={() => showWidget(true)}
          />
        </Tip>
      </WidgetButton>
    );
  };

  const renderContent = () => {
    const { shrink, clear, isFullscreen } = state;

    const changeShrink = () => {
      setState((prevState) => {
        if (prevState.isFullscreen) {
          return { ...prevState, isFullscreen: false };
        }
        const newShrink = prevState.shrink === "true" ? "false" : "true";
        localStorage.setItem("emailWidgetShrink", newShrink);
        return { ...prevState, shrink: newShrink };
      });
    };

    const hideWidget = () => {
      setState((prevState) => {
        localStorage.setItem("emailWidgetShrink", "false");
        localStorage.setItem(
          "emailWidgetShow",
          JSON.stringify({
            type: props.type || "widget",
            show: false,
          })
        );
        return { ...prevState, shrink: "false" };
      });
    };

    const onClose = () => {
      hideWidget();
      setState((prevState) => ({
        ...prevState,
        clear: true,
        isFullscreen: false,
      }));
    };

    const handleExpand = () => {
      setState((prevState) => ({
        ...prevState,
        isFullscreen: !prevState.isFullscreen,
      }));
    };

    const isWidgetShow =
      JSON.parse(localStorage.getItem("emailWidgetShow") || "{}") || {};

    const isShrink = shrink === "true" ? true : false;

    return (
      <ModalWrapper onClick={() => changeShrink()} $show={isFullscreen}>
        <WidgetWrapper
          $shrink={isShrink}
          $show={isWidgetShow.show}
          $fullScreen={isFullscreen}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <NewEmailHeader>
            <span onClick={changeShrink}>{__("New Email")}</span>
            <div>
              <Tip text={"Minimize"} placement="top">
                <Icon
                  size={10}
                  icon={shrink === "true" ? "plus" : "minus"}
                  onClick={changeShrink}
                />
              </Tip>
              <Tip
                text={isFullscreen ? "Exit full screen" : "Full screen"}
                placement="top"
              >
                <Icon
                  size={10}
                  icon={isFullscreen ? "compress" : "expand-arrows-alt"}
                  onClick={handleExpand}
                />
              </Tip>
              <Tip text={"Close"} placement="top">
                <Icon size={10} icon="cancel" onClick={onClose} />
              </Tip>
            </div>
          </NewEmailHeader>
          <MailForm
            {...props}
            isEmptyEmail={state.isEmptyEmail}
            shrink={isShrink}
            clear={clear}
            clearOnSubmit={true}
            closeModal={onClose}
          />
        </WidgetWrapper>
      </ModalWrapper>
    );
  };

  const renderWidget = () => {
    const emailWidgetShow = localStorage.getItem("emailWidgetShow") || "{}";
    const isWidgetShow = JSON.parse(emailWidgetShow) || {};

    if (window.location.href.includes("contacts")) {
      if (isWidgetShow.type === props.type) {
        return renderContent();
      }

      return null;
    }

    return renderContent();
  };

  return (
    <>
      {renderTrigger()}
      <CommonPortal>{renderWidget()}</CommonPortal>
    </>
  );
};

export default Widget;
