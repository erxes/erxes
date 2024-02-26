import * as routerUtils from '../utils/router';

import { Dialog, Transition } from '@headlessui/react';
import { __, router } from '../utils/core';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { CloseModal } from '../styles/main';
import Icon from './Icon';
import React from 'react';
// import { Transition } from 'react-transition-group';
import queryString from 'query-string';

type Props = {
  title: string;
  trigger?: React.ReactNode;
  autoOpenKey?: string;
  content: ({ closeModal }: { closeModal: () => void }) => React.ReactNode;
  size?: 'sm' | 'lg' | 'xl';
  ignoreTrans?: boolean;
  dialogClassName?: string;
  backDrop?: 'static' | boolean;
  enforceFocus?: boolean;
  hideHeader?: boolean;
  isOpen?: boolean;
  addisOpenToQueryParam?: boolean;
  paddingContent?: 'less-padding';
  centered?: boolean;
  onExit?: () => void;
  isAnimate?: boolean;
};

const ModalTrigger: React.FC<Props> = ({
  title,
  trigger,
  autoOpenKey,
  content,
  size,
  dialogClassName,
  backDrop,
  enforceFocus,
  hideHeader,
  isOpen: propIsOpen,
  addisOpenToQueryParam,
  paddingContent,
  centered,
  onExit,
  ignoreTrans,
  isAnimate = false,
}) => {
  const [isOpen, setIsOpen] = useState(propIsOpen || false);
  const [autoOpenKeyState, setAutoOpenKey] = useState('');
  // const history = {} as any;
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen: urlIsOpen } = useParams<{ isOpen?: string }>();

  useEffect(() => {
    if (autoOpenKey !== autoOpenKeyState) {
      if (routerUtils.checkHashKeyInURL({ location }, autoOpenKey)) {
        setIsOpen(true);
        setAutoOpenKey(autoOpenKey || '');
      }
    }
  }, [autoOpenKey, autoOpenKeyState]);

  useEffect(() => {
    const queryParams = queryString.parse(window.location.search);

    if (
      addisOpenToQueryParam &&
      urlIsOpen !== undefined &&
      urlIsOpen !== null
    ) {
      if (isOpen && !queryParams.isOpen) {
        router.setParams(navigate, location, {
          isModalOpen: isOpen,
        });
      }

      if (queryParams.isModalOpen) {
        router.removeParams(history, 'isModalOpen');
      }
    }
  }, [addisOpenToQueryParam, isOpen, urlIsOpen]);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const renderHeader = () => {
    if (hideHeader) {
      return (
        <CloseModal onClick={closeModal}>
          <Icon icon="times" />
        </CloseModal>
      );
    }

    return (
      // <Modal.Header closeButton={true} className={paddingContent}>
      <Dialog.Title>{ignoreTrans ? title : __(title)}</Dialog.Title>
      // </Modal.Header>
    );
  };

  const onHideHandler = () => {
    closeModal();

    if (onExit) {
      onExit();
    }
  };

  // add onclick event to the trigger component
  const triggerComponent = trigger
    ? React.cloneElement(trigger as React.ReactElement<any>, {
        onClick: openModal,
      })
    : null;

  return (
    <>
      {triggerComponent}

      <Transition appear show={isOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={closeModal}
          // dialogClassName={dialogClassName}
          // size={size}
          // show={isOpen}
          // onHide={onHideHandler}
          // backdrop={backDrop}
          // enforceFocus={enforceFocus}
          // onExit={onExit}
          // animation={isAnimate}
          // centered={centered}
        >
          <Dialog.Panel className={paddingContent}>
            {renderHeader()}
            {/* <Transition in={isOpen} timeout={300} unmountOnExit={true}> */}
            <Dialog.Description>{content({ closeModal })}</Dialog.Description>
            {/* </Transition> */}
          </Dialog.Panel>
        </Dialog>
      </Transition>
    </>
  );
};

export default ModalTrigger;
