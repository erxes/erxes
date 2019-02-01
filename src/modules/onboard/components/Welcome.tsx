import { FormControl } from 'modules/common/components';
import { Button } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import { ModalBottom, WelcomeImage, WelcomeWrapper } from './styles';

interface IProps extends IRouterProps {
  hasSeen: boolean;
  seenOnboard: (callback: () => void) => void;
}

type State = {
  isOpen?: boolean;
  isChecked?: boolean;
};

class Welcome extends React.PureComponent<IProps, State> {
  constructor(props) {
    super(props);

    this.state = { isOpen: false, isChecked: false };
  }

  closeModal = () => {
    this.setState({ isOpen: false });
  };

  start = () => {
    this.props.history.push('/getting-started');
    this.closeModal();
  };

  onChangeCheckbox = () => {
    this.setState({ isChecked: !this.state.isChecked });
  };

  onClose = () => {
    const { seenOnboard } = this.props;

    if (this.state.isChecked) {
      return seenOnboard(this.closeModal);
    }

    return this.closeModal();
  };

  componentDidMount() {
    const { hasSeen, history } = this.props;

    if (!hasSeen && history.location.pathname !== '/getting-started') {
      setTimeout(() => {
        this.setState({ isOpen: true });
      }, 2500);
    }
  }

  render() {
    const { isOpen } = this.state;

    return (
      <Modal show={isOpen} onHide={this.closeModal}>
        <Modal.Body>
          <WelcomeWrapper>
            <WelcomeImage src="/images/actions/13.svg" />
            <h1>{__('Welcome')}!</h1>
            <p>{__('Welcome paragraph')}</p>
            <Button onClick={this.start} btnStyle="success" size="large">
              {__("I'm ready to get started")}
            </Button>

            <ModalBottom>
              <FormControl
                checked={this.state.isChecked}
                componentClass="checkbox"
                onChange={this.onChangeCheckbox}
              >
                {__("Don't show again")}
              </FormControl>
              <a onClick={this.onClose}>{__('Close')} »</a>
            </ModalBottom>
          </WelcomeWrapper>
        </Modal.Body>
      </Modal>
    );
  }
}

export default withRouter<IProps>(Welcome);
