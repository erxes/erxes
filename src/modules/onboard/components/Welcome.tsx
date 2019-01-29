import { Button } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import { WelcomeImage, WelcomeWrapper } from './styles';

interface IProps extends IRouterProps {
  hasSeen: boolean;
}

type State = {
  isOpen?: boolean;
};

class Welcome extends React.PureComponent<IProps, State> {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };
  }

  closeModal = () => {
    this.setState({ isOpen: false });
  };

  start = () => {
    this.props.history.push('/getting-started');
    this.closeModal();
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
            <h1>Welcome to erxes</h1>
            <p>We’re here to help you grow your business successfully</p>
            <Button onClick={this.start} btnStyle="success" size="large">
              Let's start
            </Button>
          </WelcomeWrapper>
        </Modal.Body>
      </Modal>
    );
  }
}

export default withRouter<IProps>(Welcome);
