import {
  Link,
  NewEmailHeader,
  WidgetButton
} from '@erxes/ui-inbox/src/settings/integrations/components/mail/styles';

import Button from '@erxes/ui/src/components/Button';
import CommonPortal from '@erxes/ui/src/components/CommonPortal';
import Icon from '@erxes/ui/src/components/Icon';
import MailForm from '@erxes/ui-inbox/src/settings/integrations/containers/mail/MailForm';
import { ModalWrapper } from '../styles';
import React from 'react';
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
  shrink: string;
  clear: boolean;
  isFullscreen: boolean;
  isEmptyEmail: boolean;
};

class Widget extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      shrink: localStorage.getItem('emailWidgetShrink') || 'false',
      clear: false,
      isFullscreen: false,
      isEmptyEmail: false
    };
  }

  changeState = (state: boolean) => {
    this.setState({
      shrink: 'false',
      clear: false
    });
    localStorage.setItem(
      'emailWidgetShow',
      JSON.stringify({
        type: this.props.type || 'widget',
        show: state
      })
    );
    localStorage.setItem('emailWidgetShrink', 'false');
  };

  showWidget = (isEmptyEmail?: boolean) => {
    const { type = 'widget' } = this.props;
    const storageShow = JSON.parse(localStorage.getItem('emailWidgetShow'));
    const storageWidgetShow = storageShow ? storageShow.show : false;

    if (storageWidgetShow === false) {
      this.changeState(true);
    }
    if (storageWidgetShow === true && storageShow.type === type) {
      this.changeState(false);
    }

    if (isEmptyEmail) {
      this.setState({ isEmptyEmail: true });
    }
  };

  renderTrigger() {
    const {
      disabled,
      type = 'widget',
      buttonStyle,
      buttonSize,
      buttonText,
      emailTo,
      emailStatus
    } = this.props;

    if (type === 'action' || type === 'tab') {
      return (
        <Button
          btnStyle={buttonStyle ? buttonStyle : 'primary'}
          onClick={() => this.showWidget()}
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
        <Link onClick={() => this.showWidget()}>
          {emailTo}
          {emailStatus && emailStatus()}
        </Link>
      );
    }

    return (
      <WidgetButton>
        <Tip text={__('New Email')} placement="bottom">
          <Icon
            icon="envelope-alt"
            size={20}
            onClick={() => this.showWidget(true)}
          />
        </Tip>
      </WidgetButton>
    );
  }

  renderContent() {
    const { shrink, clear, isFullscreen } = this.state;

    const changeShrink = () => {
      if (isFullscreen) {
        this.setState({ isFullscreen: false });
      }
      this.setState({ shrink: shrink === 'true' ? 'false' : 'true' });
      localStorage.setItem(
        'emailWidgetShrink',
        shrink === 'true' ? 'false' : 'true'
      );
    };

    const hideWidget = () => {
      this.setState({ shrink: 'false' });
      localStorage.setItem('emailWidgetShrink', 'false');
      localStorage.setItem(
        'emailWidgetShow',
        JSON.stringify({
          type: this.props.type || 'widget',
          show: false
        })
      );
    };

    const onClose = () => {
      hideWidget();
      this.setState({ clear: true, isFullscreen: false });
    };

    const handleExpand = () => {
      this.setState({ isFullscreen: !this.state.isFullscreen });
    };

    const isWidgetShow =
      JSON.parse(localStorage.getItem('emailWidgetShow')) || {};

    const isShrink = shrink === 'true' ? true : false;

    return (
      <ModalWrapper onClick={() => changeShrink()} show={isFullscreen}>
        <WidgetWrapper
          shrink={isShrink}
          show={isWidgetShow.show}
          fullScreen={isFullscreen}
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <NewEmailHeader>
            <span onClick={changeShrink}>{__('New Email')}</span>
            <div>
              <Tip text={'Minimize'} placement="top">
                <Icon
                  size={10}
                  icon={shrink === 'true' ? 'plus' : 'minus'}
                  onClick={changeShrink}
                />
              </Tip>
              <Tip
                text={isFullscreen ? 'Exit full screen' : 'Full screen'}
                placement="top"
              >
                <Icon
                  size={10}
                  icon={isFullscreen ? 'compress' : 'expand-arrows-alt'}
                  onClick={handleExpand}
                />
              </Tip>
              <Tip text={'Close'} placement="top">
                <Icon size={10} icon="cancel" onClick={onClose} />
              </Tip>
            </div>
          </NewEmailHeader>
          <MailForm
            {...this.props}
            isEmptyEmail={this.state.isEmptyEmail}
            shrink={isShrink}
            clear={clear}
            clearOnSubmit={true}
            closeModal={onClose}
          />
        </WidgetWrapper>
      </ModalWrapper>
    );
  }

  renderWidget() {
    const { type = 'widget' } = this.props;

    const isWidgetShow =
      JSON.parse(localStorage.getItem('emailWidgetShow')) || {};

    if (window.location.href.includes('contacts')) {
      if (isWidgetShow.type === type) {
        return this.renderContent();
      }

      return null;
    }

    return this.renderContent();
  }

  render() {
    return (
      <>
        {this.renderTrigger()}
        <CommonPortal>{this.renderWidget()}</CommonPortal>
      </>
    );
  }
}

export default Widget;
