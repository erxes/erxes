import { CallAction, DialogWrapper, TransferCallWrapper } from "../styles";
import { Dialog, Transition } from "@headlessui/react";
import {
  DialogContent,
  ModalFooter,
  ModalOverlay,
} from "@erxes/ui/src/styles/main";
import React, { Fragment, useState } from "react";

import Form from "@erxes/ui/src/components/form/Form";
import { Icon } from "@erxes/ui/src/components";
import TransferCall from "../containers/TransferCall";
//import Dialog from '@erxes/ui/src/components/Dialog';

type Props = {
  inboxId: string;
  title: string;
  disabled: boolean;
  direction: string;
};
const DialogComponent = (props: Props) => {
  const { inboxId, disabled } = props;

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => {
    !disabled && setShow(true);
  };
  const renderContent = () => {
    return <TransferCall inboxId={inboxId} closeModal={handleClose} />;
  };

  return (
    <CallAction disabled={disabled} onClick={handleShow}>
      <TransferCallWrapper>
        <Icon size={20} icon={"forwaded-call"} />
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
            <DialogWrapper direction={props.direction}>
              <DialogContent>
                <Dialog.Panel className={`dialog-size-sm`}>
                  <Dialog.Title as="h3">
                    Transfer Call
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

export default DialogComponent;
