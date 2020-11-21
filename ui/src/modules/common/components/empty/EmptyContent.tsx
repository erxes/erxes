import Button from 'modules/common/components/Button';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icon';
import { ITEM_COLORS } from './constants';
import { Action, Container, ItemContent, Items } from './styles';

type Props = {
  content: any;
  vertical?: boolean;
  maxItemWidth?: string;
};

function EmptyContent({ content, vertical, maxItemWidth }: Props) {
  const { steps, title, description, url, urlText } = content;

  const renderButton = (
    buttonUrl: string,
    text: string,
    isOutside: boolean,
    target: string
  ) => {
    if (!buttonUrl) {
      return null;
    }

    const buttonText = __(text) || __('Learn More');

    if (isOutside) {
      return (
        <Button uppercase={false} href={buttonUrl} target={target}>
          {buttonText}
        </Button>
      );
    }

    return (
      <Button uppercase={false}>
        <Link to={buttonUrl}>{buttonText}</Link>
      </Button>
    );
  };

  return (
    <Container>
      <h2>{title}</h2>
      <p>
        {description} {url && <Link to={url}>{urlText}</Link>}
      </p>
      <Items vertical={vertical}>
        {steps.map((step, index) => (
          <ItemContent
            key={step.title + index}
            color={ITEM_COLORS[index]}
            vertical={vertical}
            max={maxItemWidth}
          >
            {step.icon ? (
              <Icon size={16} icon={step.icon} />
            ) : (
              <i>{index + 1}</i>
            )}
            <h4>{__(step.title)}</h4>
            {step.html ? (
              <p dangerouslySetInnerHTML={{ __html: step.description }} />
            ) : (
              <p>{__(step.description)}</p>
            )}
            <Action>
              {renderButton(
                step.url,
                step.urlText,
                step.isOutside,
                step.target
              )}
            </Action>
          </ItemContent>
        ))}
      </Items>
    </Container>
  );
}

export default EmptyContent;
