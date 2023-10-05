import {
  EmailWidgetsWrapper,
  Link,
  NewEmailHeader,
  WidgetButton
} from '@erxes/ui-inbox/src/settings/integrations/components/mail/styles';

import Button from '@erxes/ui/src/components/Button';
import CommonPortal from '@erxes/ui/src/components/CommonPortal';
import Icon from '@erxes/ui/src/components/Icon';
import MailForm from '@erxes/ui-inbox/src/settings/integrations/containers/mail/MailForm';
import { ModalWrapper } from '../styles';
import React, { useEffect, useRef, useState } from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { WidgetWrapper } from '@erxes/ui-inbox/src/settings/integrations/components/mail/styles';
import { __ } from '@erxes/ui/src/utils';

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
  // shrink: string;
  // clear: boolean;
  // isFullscreen: boolean;
  // isEmptyEmail: boolean;
  widgets: any[];
};

function Widget(props) {
  const [widgets, setWidgets] = useState<any>([]);

  const changeState = (state: boolean) => {
    // this.setState({
    //   shrink: 'false',
    //   clear: false,
    // });
    localStorage.setItem(
      'emailWidgetShow',
      JSON.stringify({
        type: props.type || 'widget',
        show: state
      })
    );
    localStorage.setItem('emailWidgetShrink', 'false');
  };

  const showWidget = (isEmptyEmail?: boolean) => {
    // const { type = 'widget' } = props;
    // const storageShow = JSON.parse(
    //   localStorage.getItem('emailWidgetShow') ?? ''
    // );
    // const storageWidgetShow = storageShow ? storageShow.show : false;

    // if (storageWidgetShow === false) {
    //   changeState(true);
    // }
    // if (storageWidgetShow === true && storageShow.type === type) {
    //   changeState(false);
    // }
    setWidgets(prevWidgets => [
      ...prevWidgets,
      {
        isShrink: false,
        clear: false,
        isFullscreen: false,
        isEmptyEmail: true
      }
    ]);

    // if (isEmptyEmail) {
    //   this.setState({ isEmptyEmail: true });
    // }
  };

  function renderTrigger() {
    const {
      disabled,
      type = 'widget',
      buttonStyle,
      buttonSize,
      buttonText,
      emailTo,
      emailStatus
    } = props;

    if (type === 'action' || type === 'tab') {
      return (
        <Button
          btnStyle={buttonStyle ? buttonStyle : 'primary'}
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

    if (type.includes('link')) {
      return (
        <Link onClick={() => showWidget()}>
          {emailTo}
          {emailStatus && emailStatus()}
        </Link>
      );
    }

    return (
      <WidgetButton>
        <Tip text={__('New Email')} placement="bottom">
          <Icon icon="envelope-alt" size={20} onClick={() => showWidget()} />
        </Tip>
      </WidgetButton>
    );
  }

  function renderContent() {
    const changeShrink = (index: number) => {
      const updatingWidgets = [...widgets];
      const widgetToUpdate = updatingWidgets.at(index);

      widgetToUpdate.isFullscreen = false;
      widgetToUpdate.isShrink = !widgetToUpdate.isShrink;
      setWidgets(updatingWidgets);
    };

    const hideWidget = () => {
      // this.setState({ shrink: 'false' });
      localStorage.setItem('emailWidgetShrink', 'false');
      localStorage.setItem(
        'emailWidgetShow',
        JSON.stringify({
          type: props.type || 'widget',
          show: false
        })
      );
    };

    const onClose = (id: number) => {
      // hideWidget();
      setWidgets(widgets.filter((_, index: number) => index !== id));
      // this.setState({ clear: true, isFullscreen: false });
    };

    const handleExpand = (index: number) => {
      const updatingWidgets = [...widgets];
      const widgetToUpdate = updatingWidgets.at(index);
      widgetToUpdate.isShrink = false;
      widgetToUpdate.isFullscreen = !widgetToUpdate.isFullscreen;
      setWidgets(updatingWidgets);
      // this.setState({ isFullscreen: !this.state.isFullscreen });
    };

    const isWidgetShow =
      JSON.parse(localStorage.getItem('emailWidgetShow') ?? '') || {};

    // const isShrink = shrink === 'true' ? true : false;

    const renderWidget = (widgetState, index) => {
      return (
        <ModalWrapper
          onClick={() => changeShrink(index)}
          show={widgetState.isFullscreen}
        >
          <WidgetWrapper
            shrink={widgetState.isShrink}
            show={isWidgetShow.show}
            fullScreen={widgetState.isFullscreen}
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <NewEmailHeader>
              <span onClick={() => changeShrink(index)}>{__('New Email')}</span>
              <div>
                <Tip text={'Minimize'} placement="top">
                  <Icon
                    size={10}
                    icon={widgetState.isShrink === 'true' ? 'plus' : 'minus'}
                    onClick={() => changeShrink(index)}
                  />
                </Tip>
                <Tip
                  text={
                    widgetState.isFullscreen
                      ? 'Exit full screen'
                      : 'Full screen'
                  }
                  placement="top"
                >
                  <Icon
                    size={10}
                    icon={
                      widgetState.isFullscreen
                        ? 'compress'
                        : 'expand-arrows-alt'
                    }
                    onClick={() => handleExpand(index)}
                  />
                </Tip>
                <Tip text={'Close'} placement="top">
                  <Icon
                    size={10}
                    icon="cancel"
                    onClick={() => onClose(index)}
                  />
                </Tip>
              </div>
            </NewEmailHeader>
            <MailForm
              {...props}
              // isEmptyEmail={this.state.isEmptyEmail}
              isEmptyEmail={true}
              shrink={widgetState.isShrink}
              clear={widgetState.clear}
              clearOnSubmit={true}
              closeModal={() => onClose(index)}
            />
          </WidgetWrapper>
        </ModalWrapper>
      );
    };

    return (
      <EmailWidgetsWrapper>
        {widgets.map((widget, index) => renderWidget(widget, index))}
      </EmailWidgetsWrapper>
    );
  }

  function renderWidget() {
    const { type = 'widget' } = props;

    const isWidgetShow =
      JSON.parse(localStorage.getItem('emailWidgetShow') || '') || {};

    if (window.location.href.includes('contacts')) {
      if (isWidgetShow.type === type) {
        return renderContent();
      }

      return null;
    }

    return renderContent();
  }

  return (
    <>
      {renderTrigger()}
      <CommonPortal>{renderWidget()}</CommonPortal>
    </>
  );
}

export default Widget;
