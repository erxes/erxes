import Icon from '@erxes/ui/src/components/Icon';
import { readFile } from '@erxes/ui/src/utils/core';
import React from 'react';
import styled from 'styled-components';
import { Card } from '../styles';

type Props = {
  action: any;
  handle: (id: number) => JSX.Element;
};

const LinkIcon = styled.a`
  right: 25px;
  position: absolute;
`;

function OptionalContent({ action, handle }: Props) {
  const { messages = [] } = action?.config || {};

  const renderCard = ({
    text = '',
    title = '',
    subtitle = '',
    buttons = [],
    image = '',
  }) => {
    return (
      <Card>
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
  }) => {
    switch (type) {
      case 'text':
        return renderCard({ text, buttons });
      case 'card':
        return renderCards(cards);
      case 'quickReplies':
        return renderCard({ text, buttons: quickReplies });
      case 'image':
        return renderCard({ image });

      default:
        return null;
    }
  };

  return <>{messages.map((message) => renderMessage(message))}</>;
}

export default OptionalContent;
