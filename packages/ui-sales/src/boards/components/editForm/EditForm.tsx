import { ArchiveStatus, HeaderContentSmall } from "../../styles/item";
import {
  EditFormContent,
  RightDrawerContainer,
  TopHeader,
  TopHeaderButton,
} from "../../styles/rightMenu";
import { IEditFormContent, IItem, IItemParams, IOptions } from "../../types";
import React, { useEffect, useRef, useState } from "react";
import { __, router as routerUtils } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import { ActionItem } from "../../styles/popup";
import { ArchiveBtn } from "./ArchiveBtn";
import { CSSTransition } from "react-transition-group";
import Comment from "../../../comment/containers/Comment";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import { IUser } from "@erxes/ui/src/auth/types";
import Icon from "@erxes/ui/src/components/Icon";
import Watch from "../../containers/editForm/Watch";
import { currentUser } from "@erxes/ui/src/auth/graphql";
import { isEnabled } from "@erxes/ui/src/utils/core";

type Props = {
  options: IOptions;
  item: IItem;
  addItem: (doc: IItemParams, callback: () => void, msg?: string) => void;
  synchSingleCard: (itemId: string) => void;
  removeItem: (itemId: string, callback?: () => void) => void;
  copyItem: (itemId: string, callback: () => void, msg?: string) => void;
  beforePopupClose: (afterPopupClose?: () => void) => void;
  formContent: ({ state, copy, remove }: IEditFormContent) => React.ReactNode;
  onUpdate: (item: IItem, prevStageId?) => void;
  saveItem: (doc, callback?: (item) => void) => void;
  isPopupVisible?: boolean;
  hideHeader?: boolean;
  sendToBoard?: (item: any) => void;
  refresh: boolean;
  currentUser: IUser;
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
    sendToBoard,
    currentUser,
    isPopupVisible,
  } = props;

  const location = useLocation();
  const navigate = useNavigate();
  const wrapperRef = useRef<any>(null);

  const isFullQueryParam = routerUtils.getParam(location, "isFull");

  const [stageId, setStageId] = useState(item.stageId);
  const [updatedItem, setUpdatedItem] = useState(item);
  const [prevStageId, setPrevStageId] = useState<string>("");

  const isFullMode = isFullQueryParam === "true" ? true : false;

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

  // useEffect(() => {
  //   document.addEventListener("mousedown", onHideModal);

  //   return () => {
  //     document.removeEventListener("mousedown", onHideModal);
  //   };
  // }, [isPopupVisible]);

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

  const onToggle = () => {
    if (!isFullMode) {
      return routerUtils.setParams(navigate, location, { isFull: !isFullMode });
    }

    return routerUtils.removeParams(navigate, location, "isFull");
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

      props.synchSingleCard(updatedItem._id);
      // if (updatedItem && props.onUpdate) {
      //   props.onUpdate(updatedItem, prevStageId);
      // }
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

  const renderNumber = () => {
    const { number } = item;

    if (!number) {
      return null;
    }

    return (
      <HeaderContentSmall $align="left">
        <ControlLabel>Number</ControlLabel>
        <p>{number}</p>
      </HeaderContentSmall>
    );
  };

  const renderHeader = () => {
    if (props.hideHeader) {
      return (
        <TopHeader>
          <span>{renderNumber()}</span>
          <div className="right">
            <Dropdown
              as={DropdownToggle}
              toggleComponent={
                <TopHeaderButton>
                  <Icon icon="ellipsis-h" />
                </TopHeaderButton>
              }
              isMenuWidthFit={true}
            >
              <li>
                <ActionItem>
                  <Watch item={item} options={options} isSmall={true} />
                </ActionItem>
              </li>
              <li>
                <ActionItem>
                  {(isEnabled("clientportal") && <Comment item={item} />) || ""}
                </ActionItem>
              </li>
              <li>
                <ActionItem>
                  <ArchiveBtn
                    item={item}
                    removeItem={removeItem}
                    saveItem={saveItem}
                    sendToBoard={sendToBoard}
                    onChangeStage={onChangeStage}
                    currentUser={currentUser}
                  />
                </ActionItem>
              </li>
            </Dropdown>
            <TopHeaderButton onClick={onToggle}>
              <Icon icon="window" />
            </TopHeaderButton>
            <TopHeaderButton onClick={() => closeModal()}>
              <Icon icon="times" />
            </TopHeaderButton>
          </div>
        </TopHeader>
      );
    }

    return (
      <h3>
        {__("Edit")}
        <Icon icon="times" size={24} onClick={onHideModal} />
      </h3>
    );
  };

  return (
    <div className="edit-form-trigger">
      <CSSTransition
        in={isPopupVisible}
        timeout={100}
        classNames="slide-in-right"
        unmountOnExit={true}
      >
        <RightDrawerContainer
          width={isFullMode ? "calc(100% - 100px)" : "45%"}
          ref={wrapperRef}
        >
          <EditFormContent>
            {renderArchiveStatus()}

            {renderHeader()}
            {props.formContent({
              state: { stageId, updatedItem, prevStageId },
              saveItem: saveItemHandler,
              onChangeStage,
              copy,
              remove,
            })}
          </EditFormContent>
        </RightDrawerContainer>
      </CSSTransition>
    </div>
  );
}

export default EditForm;
