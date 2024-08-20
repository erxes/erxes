import { Dialog, Transition } from "@headlessui/react";
import {
  DialogContent,
  DialogWrapper,
  ModalOverlay,
} from "@erxes/ui/src/styles/main";
import { IEditFormContent, IItem, IItemParams, IOptions } from "../../types";
import React, { Fragment, useEffect, useState } from "react";
import { __, router as routerUtils } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import { ArchiveStatus } from "../../styles/item";
import { CloseModal } from "@erxes/ui/src/styles/main";
import Icon from "@erxes/ui/src/components/Icon";
import styled from "styled-components";

const Relative = styled.div`
  position: relative;
`;

type Props = {
  options: IOptions;
  item: IItem;
  addItem: (doc: IItemParams, callback: () => void, msg?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  copyItem: (itemId: string, callback: () => void, msg?: string) => void;
  beforePopupClose: (afterPopupClose?: () => void) => void;
  formContent: ({ state, copy, remove }: IEditFormContent) => React.ReactNode;
  onUpdate: (item: IItem, prevStageId?) => void;
  saveItem: (doc, callback?: (item) => void) => void;
  isPopupVisible?: boolean;
  hideHeader?: boolean;
  refresh: boolean;
};

function EditForm(props: Props) {
  const {
    item,
    saveItem,
    onUpdate,
    removeItem,
    copyItem,
    options,
    beforePopupClose,
    refresh,
  } = props;

  const location = useLocation();
  const navigate = useNavigate();
  const [stageId, setStageId] = useState(item.stageId);
  const [updatedItem, setUpdatedItem] = useState(item);
  const [prevStageId, setPrevStageId] = useState<string>("");

  useEffect(() => {
    if (item.stageId !== stageId) {
      setPrevStageId(item.stageId);

      saveItem({ stageId }, (updatedItem) => {
        if (onUpdate) {
          onUpdate(updatedItem, prevStageId);
        }
      });
    }
  }, [stageId]);

  useEffect(() => {
    if (props.item !== updatedItem) {
      setUpdatedItem(props.item);
    }
  }, [item]);

  const onChangeStage = (stageId: string) => {
    setStageId(stageId);
    const { item } = props;

    if (item.stageId !== stageId) {
      setPrevStageId(item.stageId);
    }
  };

  const saveItemHandler = (doc: { [key: string]: any }) => {
    saveItem(doc, (updatedItem) => {
      setUpdatedItem(updatedItem);
    });
  };

  const remove = (id: string) => {
    removeItem(id, closeModal);
  };

  const copy = () => {
    copyItem(item._id, closeModal, options.texts.copySuccessText);
  };

  const closeModal = (afterPopupClose?: () => void) => {
    if (beforePopupClose) {
      beforePopupClose(afterPopupClose);
    } else if (afterPopupClose) {
      afterPopupClose();
    }
  };

  const onHideModal = () => {
    if (refresh) {
      routerUtils.setParams(navigate, location, { key: Math.random() });
    }

    closeModal(() => {
      if (updatedItem) {
        const itemName = localStorage.getItem(`${updatedItem._id}Name`) || "";

        if (itemName && updatedItem.name !== itemName) {
          saveItemHandler({ itemName });
        }

        localStorage.removeItem(`${updatedItem._id}Name`);
      }

      if (updatedItem && props.onUpdate) {
        props.onUpdate(updatedItem, prevStageId);
      }
    });
  };

  const renderArchiveStatus = () => {
    if (item.status === "archived") {
      return (
        <ArchiveStatus>
          <Icon icon="archive-alt" />
          <span>{__("This card is archived.")}</span>
        </ArchiveStatus>
      );
    }

    return null;
  };

  const renderHeader = () => {
    if (props.hideHeader) {
      return (
        <CloseModal onClick={onHideModal}>
          <Icon icon="times" />
        </CloseModal>
      );
    }

    return (
      <Dialog.Title as="h3">
        {__("Edit")}
        <Icon icon="times" size={24} onClick={onHideModal} />
      </Dialog.Title>
    );
  };

  return (
    <Transition appear show={props.isPopupVisible} as={Fragment}>
      <Dialog as="div" onClose={onHideModal} className={` relative z-10`}>
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
            <Dialog.Panel className={` dialog-size-xl`}>
              {renderArchiveStatus()}

              <Transition.Child>
                <Relative>
                  {renderHeader()}
                  <div className="dialog-description">
                    {props.formContent({
                      state: { stageId, updatedItem, prevStageId },
                      saveItem: saveItemHandler,
                      onChangeStage,
                      copy,
                      remove,
                    })}
                  </div>
                </Relative>
              </Transition.Child>
            </Dialog.Panel>
          </DialogContent>
        </DialogWrapper>
      </Dialog>
    </Transition>
  );
}

export default EditForm;
