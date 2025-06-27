import { CallAction, DialogWrapper, TransferCallWrapper } from '../styles';
import { Dialog, Transition } from '@headlessui/react';
import { DialogContent, ModalOverlay } from '@erxes/ui/src/styles/main';
import React, { Fragment, useState } from 'react';

import Form from '@erxes/ui/src/components/form/Form';
import { Icon } from '@erxes/ui/src/components';
import SelectCustomerContainer from '../containers/SelectCustomer';

type Props = {
  inboxId: string;
  title: string;
  disabled: boolean;
  phoneNumber: string;
  conversationId: string;
};
const CustomerList = (props: Props) => {
  const { inboxId, disabled, phoneNumber, conversationId } = props;

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => {
    !disabled && setShow(true);
  };
  const renderContent = () => {
    return (
      <SelectCustomerContainer
        inboxId={inboxId}
        closeModal={handleClose}
        phoneNumber={phoneNumber}
        conversationId={conversationId}
      />
    );
  };

  return (
    <CallAction disabled={disabled} onClick={handleShow}>
      <TransferCallWrapper>
        <Icon size={20} icon={'user'} />
        <Transition appear show={show} as={React.Fragment}>
          <Dialog
            as="div"
            onClose={handleClose}
            className={` relative z-10`}
            open={show}
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
                <Dialog.Panel className={`dialog-size-sm`}>
                  <Dialog.Title as="h3">
                    Select customer
                    <Icon icon="times" size={24} onClick={handleClose} />
                  </Dialog.Title>
                  <Transition.Child>
                    <div className="dialog-description">
                      <Form renderContent={renderContent} />
                    </div>
                  </Transition.Child>
                </Dialog.Panel>
              </DialogContent>
            </DialogWrapper>
          </Dialog>
        </Transition>
      </TransferCallWrapper>
    </CallAction>
  );
};

export default CustomerList;
