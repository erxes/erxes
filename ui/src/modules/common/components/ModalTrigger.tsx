import { __ } from 'modules/common/utils';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import RTG from 'react-transition-group';
import { CloseModal } from '../styles/main';
import { IRouterProps } from '../types';
import routerUtils from '../utils/router';
import Icon from './Icon';

type Props = {
  title: string;
  trigger?: React.ReactNode;
  autoOpenKey?: string;
  content: ({ closeModal }: { closeModal: () => void }) => void;
  size?: 'sm' | 'lg' | 'xl';
  ignoreTrans?: boolean;
  dialogClassName?: string;
  backDrop?: 'static' | boolean;
  enforceFocus?: boolean;
  hideHeader?: boolean;
  isOpen?: boolean;
  history: any;
  paddingContent?: 'less-padding';
  centered?: boolean;
  onExit?: () => void;
  isAnimate?: boolean;
} & IRouterProps;

type State = {
  isOpen?: boolean;
  autoOpenKey?: string;
};

class ModalTrigger extends React.Component<Props, State> {
  static getDerivedStateFromProps(props, state) {
    if (props.autoOpenKey !== state.autoOpenKey) {
      if (routerUtils.checkHashKeyInURL(props.history, props.autoOpenKey)) {
        return {
          isOpen: true,
          autoOpenKey: props.autoOpenKey
        };
      }
    }

    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen || false,
      autoOpenKey: ''
    };
  }

  openModal = () => {
    this.setState({ isOpen: true });
  };

  closeModal = () => {
    this.setState({ isOpen: false });
  };

  renderHeader = () => {
    if (this.props.hideHeader) {
      return (
        <CloseModal onClick={this.closeModal}>
          <Icon icon="times" />
        </CloseModal>
      );
    }

    const { title, ignoreTrans, paddingContent } = this.props;

    return (
      <Modal.Header closeButton={true} className={paddingContent}>
        <Modal.Title>{ignoreTrans ? title : __(title)}</Modal.Title>
      </Modal.Header>
    );
  };

  render() {
    const {
      trigger,
      size,
      dialogClassName,
      content,
      backDrop,
      enforceFocus,
      onExit,
      paddingContent,
      centered,
      isAnimate = false
    } = this.props;

    const { isOpen } = this.state;

    // add onclick event to the trigger component
    const triggerComponent = trigger
      ? React.cloneElement(trigger as React.ReactElement<any>, {
          onClick: this.openModal
        })
      : null;

    return (
      <>
        {triggerComponent}

        <Modal
          dialogClassName={dialogClassName}
          size={size}
          show={isOpen}
          onHide={this.closeModal}
          backdrop={backDrop}
          enforceFocus={enforceFocus}
          onExit={onExit}
          animation={isAnimate}
          centered={centered}
        >
          {this.renderHeader()}
          <Modal.Body className={paddingContent}>
            <RTG.Transition in={isOpen} timeout={300} unmountOnExit={true}>
              {content({ closeModal: this.closeModal })}
            </RTG.Transition>
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

export default withRouter(ModalTrigger);
