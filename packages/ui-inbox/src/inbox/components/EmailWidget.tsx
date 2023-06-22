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
  notWidget?: boolean;
  disabled?: boolean;
  emailTo?: string;
  buttonStyle?: string;
  buttonText?: string;
  customerId?: string;
  buttonSize?: string;
};

type State = {
  shrink: string;
  show: boolean;
  clear: boolean;
};

class Widget extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      shrink: localStorage.getItem('emailWidgetShrink') || 'false',
      show: true,
      clear: false
    };
  }
  render() {
    const { shrink, show, clear } = this.state;
    const {
      notWidget,
      buttonStyle,
      disabled,
      buttonText,
      buttonSize
    } = this.props;

    const changeShrink = () => {
      this.setState({ shrink: shrink === 'true' ? 'false' : 'true' });
      localStorage.setItem(
        'emailWidgetShrink',
        shrink === 'true' ? 'false' : 'true'
      );
    };

    const hideWidget = () => {
      this.setState({ show: false, shrink: 'false' });
      localStorage.setItem('emailWidgetShrink', 'false');
      localStorage.setItem('emailWidgetShow', 'false');
    };

    const onClose = () => {
      hideWidget();
      this.setState({ clear: true });
    };

    const showWidget = () => {
      this.setState({ shrink: 'false', show: !show, clear: false });
      localStorage.setItem('emailWidgetShrink', 'false');
      localStorage.setItem('emailWidgetShow', show ? 'true' : 'false');
    };

    const isWidgetShow =
      localStorage.getItem('emailWidgetShow') === 'true' ? true : false;
    const isShrink = shrink === 'true' ? true : false;

    return (
      <>
        {notWidget ? (
          <Button
            btnStyle={buttonStyle ? buttonStyle : 'primary'}
            onClick={() => showWidget()}
            disabled={disabled}
            size={buttonSize}
          >
            <Tip text="Send e-mail" placement="top-end">
              <Icon icon="envelope-alt" />
            </Tip>{' '}
            {buttonText && buttonText}
          </Button>
        ) : (
          <WidgetButton>
            <Tip text={__('New Email')} placement="bottom">
              <Icon
                icon="envelope-alt"
                size={20}
                onClick={() => showWidget()}
              />
            </Tip>
          </WidgetButton>
        )}
        <WidgetWrapper shrink={isShrink} show={isWidgetShow}>
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
      </>
    );
  }
}

export default Widget;
