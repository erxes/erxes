import * as routerUtils from '../utils/router';

import {
  CloseModal,
  DialogContent,
  DialogWrapper,
  ModalOverlay,
} from '../styles/main';
import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { __, router } from '../utils/core';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import Icon from './Icon';
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

  // useEffect(() => {
  //   if (autoOpenKey !== autoOpenKeyState) {
  //     if (routerUtils.checkHashKeyInURL({ location }, autoOpenKey)) {
  //       setIsOpen(true);
  //       setAutoOpenKey(autoOpenKey || "");
  //     }
  //   }
  // }, [autoOpenKey, autoOpenKeyState]);

  // useEffect(() => {
  //   const queryParams = queryString.parse(window.location.search);

  //   if (
  //     addisOpenToQueryParam &&
  //     urlIsOpen !== undefined &&
  //     urlIsOpen !== null
  //   ) {
  //     if (isOpen && !queryParams.isOpen) {
  //       router.setParams(navigate, location, {
  //         isModalOpen: isOpen,
  //       });
  //     }

  //     if (queryParams.isModalOpen) {
  //       router.removeParams(history, "isModalOpen");
  //     }
  //   }
  // }, [addisOpenToQueryParam, isOpen, urlIsOpen]);

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

      {isOpen && (
        // <Transition appear show={true} as={Fragment}>
        <Dialog
          open={true}
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
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ModalOverlay />
          </Transition.Child>
          <DialogWrapper>
            <DialogContent>
              <Dialog.Panel className={paddingContent}>
                <Dialog.Title as="h3">
                  {ignoreTrans ? title : __(title)}
                </Dialog.Title>
                <Transition.Child>
                  <Dialog.Description className="dialog-description">
                    {content({ closeModal })}
                  </Dialog.Description>
                </Transition.Child>
              </Dialog.Panel>
            </DialogContent>
          </DialogWrapper>
        </Dialog>
        // </Transition>
      )}
    </>
  );
};

export default ModalTrigger;
