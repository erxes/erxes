import React from 'react';
import MailForm from '@erxes/ui-inbox/src/settings/integrations/containers/mail/MailForm';
import Icon from '@erxes/ui/src/components/Icon';
import { WidgetWrapper } from '@erxes/ui-inbox/src/settings/integrations/components/mail/styles';
import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils';
import {
  NewEmailHeader,
  WidgetButton
} from '@erxes/ui-inbox/src/settings/integrations/components/mail/styles';

type Props = {
  disabled?: boolean;
  emailTo?: string;
  buttonStyle?: string;
  buttonText?: string;
  customerId?: string;
  buttonSize?: string;
  type?: string;
};

type State = {
  shrink: string;
  clear: boolean;
};

class Widget extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      shrink: localStorage.getItem('emailWidgetShrink') || 'false',
      clear: false
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

  showWidget = () => {
    const { type = 'widget' } = this.props;
    const storageData = JSON.parse(localStorage.getItem('emailWidgetShow'));
    const storageDataShow = storageData ? storageData.show : false;

    if (storageDataShow === false) {
      this.changeState(true);
    }
    if (storageDataShow === true && storageData.type === type) {
      this.changeState(false);
    }
  };

  renderTrigger() {
    const {
      disabled,
      type = 'widget',
      buttonStyle,
      buttonSize,
      buttonText
    } = this.props;

    if (type !== 'widget') {
      return (
        <Button
          btnStyle={buttonStyle ? buttonStyle : 'primary'}
          onClick={() => this.showWidget()}
          disabled={disabled}
          size={buttonSize}
        >
          <Tip text="Send e-mail" placement="top-end">
            <Icon icon="envelope-alt" />
          </Tip>{' '}
          {buttonText && buttonText}
        </Button>
      );
    }

    return (
      <WidgetButton>
        <Tip text={__('New Email')} placement="bottom">
          <Icon
            icon="envelope-alt"
            size={20}
            onClick={() => this.showWidget()}
          />
        </Tip>
      </WidgetButton>
    );
  }

  renderContent() {
    const { shrink, clear } = this.state;

    const changeShrink = () => {
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
      this.setState({ clear: true });
    };

    const isWidgetShow =
      JSON.parse(localStorage.getItem('emailWidgetShow')) || {};
    const isShrink = shrink === 'true' ? true : false;

    return (
      <WidgetWrapper shrink={isShrink} show={isWidgetShow.show}>
        <NewEmailHeader onClick={changeShrink}>
          {__('New Email')}
          <div>
            <Icon size={10} icon={shrink === 'true' ? 'plus' : 'minus'} />
            <Icon size={10} icon="cancel" onClick={() => onClose()} />
          </div>
        </NewEmailHeader>
        <MailForm
          {...this.props}
          shrink={isShrink}
          clear={clear}
          clearOnSubmit={true}
        />
      </WidgetWrapper>
    );
  }

  renderWidget() {
    const { type = 'widget' } = this.props;

    const isWidgetShow =
      JSON.parse(localStorage.getItem('emailWidgetShow')) || {};

    if (window.location.href.includes('contacts/details')) {
      return <>{type === isWidgetShow.type && this.renderContent()}</>;
    }

    return this.renderContent();
  }

  render() {
    return (
      <>
        {this.renderTrigger()}
        {this.renderWidget()}
      </>
    );
  }
}

export default Widget;
