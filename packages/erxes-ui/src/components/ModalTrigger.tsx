import * as routerUtils from "../utils/router";

import {
  CloseModal,
  DialogContent,
  DialogWrapper,
  ModalOverlay,
} from "../styles/main";
import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { __, router } from "../utils/core";
import { useLocation, useNavigate } from "react-router-dom";

import Icon from "./Icon";
import queryString from "query-string";

type Props = {
  title: string;
  as?: string | any;
  trigger?: React.ReactNode;
  autoOpenKey?: string;
  content: ({ closeModal }: { closeModal: () => void }) => React.ReactNode;
  size?: "sm" | "lg" | "xl";
  ignoreTrans?: boolean;
  dialogClassName?: string;
  backDrop?: "static" | boolean;
  enforceFocus?: boolean;
  hideHeader?: boolean;
  isOpen?: boolean;
  addisOpenToQueryParam?: boolean;
  paddingContent?: "less-padding";
  centered?: boolean;
  onExit?: () => void;
  isAnimate?: boolean;
};

const ModalTrigger: React.FC<Props> = ({
  title,
  trigger,
  autoOpenKey,
  content,
  as = "div",
  size = "sm",
  dialogClassName,
  enforceFocus,
  hideHeader,
  isOpen,
  addisOpenToQueryParam,
  paddingContent,
  onExit,
  ignoreTrans,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpenTrigger, setIsOpen] = useState(isOpen || false);
  const [autoOpenKeyState, setAutoOpenKey] = useState("");

  // const { isOpen: urlIsOpen } = useParams<{ isOpen?: string }>();

  useEffect(() => {
    if (autoOpenKey !== autoOpenKeyState) {
      if (routerUtils.checkHashKeyInURL({ location }, autoOpenKey)) {
        setIsOpen(true);
        setAutoOpenKey(autoOpenKey || "");
      }
    }
  }, [autoOpenKey, autoOpenKeyState]);

  useEffect(() => {
    const queryParams = queryString.parse(window.location.search);

    if (addisOpenToQueryParam) {
      if (isOpenTrigger && !queryParams.isOpen) {
        router.setParams(navigate, location, {
          isModalOpen: isOpenTrigger,
        });
      }

      if (queryParams.isModalOpen) {
        router.removeParams(navigate, location, "isModalOpen");
      }
    }
  }, [addisOpenToQueryParam, isOpen]);

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
      <Dialog.Title as="h3">
        {ignoreTrans ? title : __(title)}
        <Icon icon="times" size={24} onClick={closeModal} />
      </Dialog.Title>
    );
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

      {isOpenTrigger && (
        <Dialog
          open={true}
          as={as ? as : "div"}
          onClose={closeModal}
          className={`${dialogClassName} relative z-10`}
          initialFocus={(enforceFocus as any) || false}
        >
          <Transition
            as={Fragment}
            show={isOpenTrigger}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ModalOverlay />
          </Transition>
          <DialogWrapper>
            <DialogContent>
              <Dialog.Panel className={`${paddingContent} dialog-size-${size}`}>
                {renderHeader()}
                <div className="dialog-description">
                  {content({ closeModal })}
                </div>
              </Dialog.Panel>
            </DialogContent>
          </DialogWrapper>
        </Dialog>
      )}
    </>
  );
};

export default ModalTrigger;
