import Icon from '@erxes/ui/src/components/Icon';
import { readFile } from '@erxes/ui/src/utils/core';
import React from 'react';
import styled from 'styled-components';
import { Card } from '../styles';
import { Flex } from '@erxes/ui/src/styles/main';

type Props = {
  action: any;
  handle: (id: number) => JSX.Element;
};

const LinkIcon = styled.a`
  right: 25px;
  position: absolute;
`;

function OptionalContent({ action, handle }: Props) {
  const { automation, config } = action || {};
  const { messages = [] } = config || {};

  const renderExtraContent = ({ children, icon }) => {
    return (
      <Flex className="extraContent">
        <Icon icon={icon} /> {children}
      </Flex>
    );
  };

  const renderCard = ({
    _id,
    text = '',
    title = '',
    subtitle = '',
    buttons = [],
    image = '',
    audio = '',
    video = '',
    attachments = [],
  }: any) => {
    return (
      <Card key={_id}>
        {!!attachments?.length &&
          renderExtraContent({
            icon: 'attach',
            children: attachments.map(({ name }) => <p>{name}</p>),
          })}
        {video &&
          renderExtraContent({
            icon: 'film',
            children: video,
          })}
        {audio &&
          renderExtraContent({
            icon: 'music-1',
            children: audio,
          })}
        {image && <img src={readFile(image)} alt={image} />}
        <p>{text || title}</p>
        <span>{subtitle}</span>
        {buttons.map(({ _id, text, link }) => (
          <li key={`${_id}-right`} className="optional-connect">
            {text}
            {link ? (
              <LinkIcon href={link} target="_blank">
                <Icon icon="link" />
              </LinkIcon>
            ) : (
              handle(_id)
            )}
          </li>
        ))}
      </Card>
    );
  };
  const renderCards = (cards = []) => {
    return <>{cards.map((card) => renderCard(card))}</>;
  };

  const renderMessage = ({
    type,
    text,
    buttons,
    cards,
    image,
    quickReplies,
    audio,
    video,
    attachments,
    input,
  }: any) => {
    const botId = automation?.triggers.find(
      (trigger) =>
        trigger?.type?.includes('instagram') && !!trigger?.config?.botId,
    )?.config?.botId;

    switch (type) {
      case 'text':
        return renderCard({ text, buttons });
      case 'card':
        return renderCards(cards);
      case 'quickReplies':
        return renderCard({ text, buttons: quickReplies });
      case 'image':
        return renderCard({ image });
      case 'video':
        return renderCard({ video });
      case 'audio':
        return renderCard({ audio });
      case 'attachments':
        return renderCard({ attachments });
      case 'input':
        return renderCard({
          text: input.text,
          subtitle: `Input expires in: ${input.value} ${input.timeType}`,
          buttons: [
            { _id: botId, text: 'If Reply' },
            { _id: 'ifNotReply', text: 'If Not Reply' },
          ],
        });

      default:
        return null;
    }
  };

  return (
    <>
      {messages.map((message) => (
        <div key={message?._id}>{renderMessage(message)}</div>
      ))}
    </>
  );
}

export default OptionalContent;
