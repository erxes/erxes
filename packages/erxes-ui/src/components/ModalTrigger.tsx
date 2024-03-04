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
import queryString from 'query-string';

type Props = {
  title: string;
  as?: string | any;
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
  as = 'div',
  size = 'sm',
  dialogClassName,
  enforceFocus,
  hideHeader,
  isOpen: propIsOpen,
  addisOpenToQueryParam,
  paddingContent,
  onExit,
  ignoreTrans,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(propIsOpen || false);
  const [autoOpenKeyState, setAutoOpenKey] = useState('');

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

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

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
        <Dialog
          open={true}
          as={as ? as : 'div'}
          onClose={closeModal}
          className={`${dialogClassName} relative z-10`}
          initialFocus={(enforceFocus as any) || false}
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
              <Dialog.Panel className={`${paddingContent} dialog-size-${size}`}>
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
      )}
    </>
  );
};

export default ModalTrigger;
