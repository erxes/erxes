import PlaceHolderInput from '@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput';
import { IAction } from '@erxes/ui-automations/src/types';
import {
  Button,
  ControlLabel,
  FormControl,
  Icon,
  SortableList,
} from '@erxes/ui/src';
import colors from '@erxes/ui/src/styles/colors';
import dimensions from '@erxes/ui/src/styles/dimensions';
import { Column, ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';
import styled from 'styled-components';
import { BOTTOM_BAR_ITEMS, INITIAL_OBJ_ACTIONS } from '../../constants';
import {
  BottomBarAction,
  BottomBarActionsContainer,
  BottomBarContainer,
  ContentWrapper,
  MainContent,
  Wrapper,
} from '../../styles';
import ButtonsGenerator from './ButtonGenerator';
import Cards from './Cards';
import ImageUploader from './ImageUpload';
import PreviewWidget from './Preview';

export const TabAction = styled.div`
  padding-left: ${dimensions.unitSpacing}px;
  color: ${colors.colorCoreGray};
  text-align: end;

  &:hover {
    cursor: pointer;
  }
`;

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
  const { messages = [] } = config;

  const handleChange = (_id, name, value) => {
    const updateMessages = messages.map((message) =>
      message._id === _id ? { ...message, [name]: value } : message,
    );

    setConfig({ ...config, messages: updateMessages });
  };

  const renderText = ({ _id, text, buttons }) => {
    const onChange = ({ text }) => {
      handleChange(_id, 'text', text);
    };

    return (
      <Column>
        <ControlLabel>{__('Text')}</ControlLabel>
        <PlaceHolderInput
          config={{ text }}
          triggerType={triggerType}
          inputName="text"
          componentClass="textarea"
          label=""
          placeholder="Enter your text..."
          onChange={onChange}
        />
        <ButtonsGenerator _id={_id} buttons={buttons} onChange={handleChange} />
      </Column>
    );
  };

  const renderImage = ({ _id, image }) => {
    const handleUpload = (response) => {
      handleChange(_id, 'image', response);
    };

    return (
      <div>
        <ControlLabel>{__('Image')}</ControlLabel>
        <ImageUploader src={image} onUpload={handleUpload} />
      </div>
    );
  };

  const renderCards = ({ _id, cards }) => {
    const handleChangeCards = (cards) => {
      handleChange(_id, 'cards', cards);
    };

    return (
      <div>
        <ControlLabel>{__('Cards')}</ControlLabel>
        <Cards cards={cards} onChange={handleChangeCards} />
      </div>
    );
  };

  const renderQuickReplies = ({ _id, quickReplies, text }) => {
    const handleChangeQuickReplies = (_id, name, value) => {
      handleChange(_id, 'quickReplies', value);
    };

    const handleChangeInput = (e) => {
      const { value } = e.currentTarget as HTMLInputElement;

      handleChange(_id, 'text', value);
    };

    return (
      <div>
        <ControlLabel>{__('Quick Replies')}</ControlLabel>

        <FormControl
          placeholder="enter your text"
          value={text}
          onChange={handleChangeInput}
        />

        <ButtonsGenerator
          _id={_id}
          buttons={quickReplies}
          onChange={handleChangeQuickReplies}
          hideMenu
          addButtonLabel="Add Quick Reply"
        />
      </div>
    );
  };
  const renderComponent = ({
    type,
    _id,
    text,
    buttons,
    image,
    cards,
    quickReplies,
  }) => {
    switch (type) {
      case 'text':
        return renderText({ _id, text, buttons });
      case 'image':
        return renderImage({ _id, image });
      case 'card':
        return renderCards({ _id, cards });
      case 'quickReplies':
        return renderQuickReplies({ _id, text, quickReplies });
      default:
        return null;
    }
  };

  const renderContent = (props) => {
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
          emptyMessage={'empty'}
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
          <PreviewWidget messages={messages} />
          <Button btnStyle="success" icon="checked-1" block onClick={onSave}>
            Save
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
