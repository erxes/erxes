import { BOTTOM_BAR_ITEMS, INITIAL_OBJ_ACTIONS } from "../../constants";
import {
  BottomBarAction,
  BottomBarActionsContainer,
  BottomBarContainer,
  ContentWrapper,
  FieldInfo,
  MainContent,
  PreviewButton,
  Wrapper,
} from "../../styles";
import {
  Column,
  Flex,
  FlexCenter,
  ModalFooter,
} from "@erxes/ui/src/styles/main";
import React, { useEffect, useState } from "react";

import Alert from "@erxes/ui/src/utils/Alert/index";
import Button from "@erxes/ui/src/components/Button";
import ButtonsGenerator from "./ButtonGenerator";
import Cards from "./Cards";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IAction } from "@erxes/ui-automations/src/types";
import Icon from "@erxes/ui/src/components/Icon";
import ImageUploader from "./ImageUpload";
import { Message } from "./types";
import PlaceHolderInput from "@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput";
import PreviewWidget from "./Preview";
import SortableList from "@erxes/ui/src/components/SortableList";
import { TimeSetter } from "./utils";
import Uploader from "@erxes/ui/src/components/Uploader";
import { __ } from "@erxes/ui/src/utils/core";
import colors from "@erxes/ui/src/styles/colors";
import dimensions from "@erxes/ui/src/styles/dimensions";
import styled from "styled-components";

export const TabAction = styled.div`
  padding-left: ${dimensions.unitSpacing}px;
  color: ${colors.colorCoreGray};
  text-align: end;

  &:hover {
    cursor: pointer;
  }
`;

const checkIsAbleAddMessage = (messages, type) => {
  if (
    type === "input" &&
    messages.find((message) => message.type === "input")
  ) {
    throw new Error(
      "You cannot add multiple input messages on more than one in action"
    );
  }

  if (messages?.length === 5) {
    throw new Error("You can only 5 messages per action");
  }
};

type Props = {
  onSave: () => void;
  closeModal: () => void;
  activeAction: IAction;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  triggerType: string;
};

function ReplyFbMessage({
  closeModal,
  addAction,
  activeAction,
  triggerType,
}: Props) {
  const [config, setConfig] = useState(activeAction?.config || {});
  const [error, setError] = useState(false);
  const { messages = [] as Message[] } = config;

  const handleChange = (_id, name, value) => {
    const updateMessages = messages.map((message) =>
      message._id === _id ? { ...message, [name]: value } : message
    );

    setConfig({ ...config, messages: updateMessages });
  };

  const renderText = ({ _id, text, buttons }) => {
    const limit = buttons.length ? 640 : 2000;
    const onChange = ({ text }) => {
      handleChange(_id, "text", text);
    };

    useEffect(() => {
      if (text.length > limit) {
        setError(true);
      } else if (!!error && text.length < limit) {
        setError(false);
      }
    }, [buttons, text]);

    return (
      <Column>
        <ControlLabel>
          {__("Text")}
          <FieldInfo
            error={text.length > limit}
          >{`${text?.length}/${limit}`}</FieldInfo>
        </ControlLabel>

        <PlaceHolderInput
          config={{ text }}
          triggerType={triggerType}
          inputName="text"
          componentClass="textarea"
          label=""
          placeholder={__("Enter your text...")}
          onChange={onChange}
          textLimit={limit}
        />

        <ButtonsGenerator
          _id={_id}
          buttons={buttons}
          onChange={handleChange}
          limit={3}
        />
      </Column>
    );
  };

  const renderImage = ({ _id, image }) => {
    const handleUpload = (response) => {
      handleChange(_id, "image", response);
    };

    return (
      <div>
        <ControlLabel>{__("Image")}</ControlLabel>
        <ImageUploader src={image} onUpload={handleUpload} />
      </div>
    );
  };

  const renderCards = ({ _id, cards }) => {
    const handleChangeCards = (cards) => {
      handleChange(_id, "cards", cards);
    };

    return (
      <div>
        <ControlLabel>{__("Cards")}</ControlLabel>
        <Cards cards={cards} onChange={handleChangeCards} />
      </div>
    );
  };

  const renderQuickReplies = ({ _id, quickReplies, text }) => {
    const handleChangeQuickReplies = (_id, name, value) => {
      handleChange(_id, "quickReplies", value);
    };

    const handleChangeInput = (e) => {
      const { value } = e.currentTarget as HTMLInputElement;

      if (value?.length > 640) {
        return;
      }

      handleChange(_id, "text", value);
    };

    return (
      <div>
        <ControlLabel>{__("Quick Replies")}</ControlLabel>

        <FieldInfo>{`${text?.length || 0}/640`}</FieldInfo>

        <FormControl
          placeholder={__("Enter your text")}
          value={text}
          onChange={handleChangeInput}
        />

        <ButtonsGenerator
          _id={_id}
          buttons={quickReplies}
          onChange={handleChangeQuickReplies}
          hideMenu
          addButtonLabel="Add Quick Reply"
          type="quickReplies"
          limit={13}
        />
      </div>
    );
  };

  const renderAudio = ({ _id, audio }) => {
    const handleUpload = (response) => {
      handleChange(_id, "audio", response);
    };
    return (
      <div>
        <ImageUploader
          src={audio}
          onUpload={handleUpload}
          label={__("Upload Audio")}
          fileType="audio/*"
          previewIcon="music-1"
          limit="25MB"
        />
      </div>
    );
  };
  const renderVideo = ({ _id, video }) => {
    const handleUpload = (response) => {
      handleChange(_id, "video", response);
    };
    return (
      <div>
        <ImageUploader
          src={video}
          onUpload={handleUpload}
          label={__("Upload Video")}
          fileType="video/*"
          previewIcon="film"
          limit="25MB"
        />
      </div>
    );
  };
  const renderAttachements = ({ _id, attachments }) => {
    return (
      <div>
        <Uploader
          defaultFileList={attachments || []}
          onChange={(attachments) =>
            handleChange(_id, "attachments", attachments)
          }
        />
      </div>
    );
  };
  const renderInput = ({ _id, input }) => {
    const onChange = (name, value) => {
      handleChange(_id, "input", { ...input, [name]: value });
    };

    return (
      <div>
        <FormGroup>
          <ControlLabel>
            {__("Text")}
            <FieldInfo>{`${input?.text?.length || 0}/2000`}</FieldInfo>
          </ControlLabel>
          <FormControl
            defaultValue={input.text || ""}
            onChange={(e) =>
              onChange("text", (e.currentTarget as HTMLInputElement).value)
            }
          />
        </FormGroup>
        <Flex>
          <FlexCenter>
            <ControlLabel>{__("User Input expires in:")}</ControlLabel>
            <TimeSetter input={input} onChange={onChange} />
          </FlexCenter>
        </Flex>
      </div>
    );
  };

  const renderComponent = ({ type, ...props }: Message) => {
    switch (type) {
      case "text":
        return renderText(props);
      case "image":
        return renderImage(props);
      case "card":
        return renderCards(props);
      case "quickReplies":
        return renderQuickReplies(props);
      case "audio":
        return renderAudio(props);
      case "video":
        return renderVideo(props);
      case "attachments":
        return renderAttachements(props);
      case "input":
        return renderInput(props);
      default:
        return null;
    }
  };

  const renderContent = (props: Message) => {
    const { _id } = props;

    const removeMessage = () => {
      setConfig({
        ...config,
        messages: messages.filter((message) => message._id !== _id),
      });
    };

    return (
      <ContentWrapper key={_id}>
        {renderComponent(props)}
        <Icon icon="cancel" onClick={removeMessage} />
      </ContentWrapper>
    );
  };

  const renderContents = () => {
    const onChangeFields = (messages) => {
      setConfig({ ...config, messages });
    };

    return (
      <div style={{ paddingRight: 25 }}>
        <SortableList
          fields={messages}
          child={renderContent}
          onChangeFields={onChangeFields}
          showDragHandler={false}
          droppableId="property option fields"
          emptyMessage={"empty"}
        />
      </div>
    );
  };

  const renderButtomBar = () => {
    const onSave = () => {
      addAction(activeAction, activeAction.id, config);

      closeModal();
    };

    const addMessage = (type) => {
      const initialValues = INITIAL_OBJ_ACTIONS[type];

      try {
        checkIsAbleAddMessage(messages, type);
      } catch (error) {
        return Alert.error(error.message);
      }

      const updateMessages = messages.concat({
        _id: Math.random(),
        type,
        ...initialValues,
      });

      setConfig({ ...config, messages: updateMessages });
    };

    return (
      <BottomBarContainer>
        <BottomBarActionsContainer>
          {BOTTOM_BAR_ITEMS.map(({ title, icon, type }) => (
            <BottomBarAction onClick={() => addMessage(type)}>
              <Icon icon={icon} />
              <p>{title}</p>
            </BottomBarAction>
          ))}
        </BottomBarActionsContainer>
        <ModalFooter>
          <PreviewButton>
            <PreviewWidget messages={messages} />
          </PreviewButton>
          <Button
            btnStyle="success"
            icon="checked-1"
            block
            onClick={onSave}
            disabled={error}
          >
            {__("Save")}
          </Button>
        </ModalFooter>
      </BottomBarContainer>
    );
  };

  return (
    <Wrapper>
      <MainContent>{renderContents()}</MainContent>
      {renderButtomBar()}
    </Wrapper>
  );
}

export default ReplyFbMessage;
