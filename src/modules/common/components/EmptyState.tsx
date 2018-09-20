import { __ } from 'modules/common/utils';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '../styles';
import Button from './Button';
import Icon from './Icon';

const EmptyStateStyled = styledTS<{ hugeness: string }>(styled.div)`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  justify-content: center;
  text-align: center;
  font-size: 14px;
  padding: 20px;
  color: ${colors.colorCoreGray};

  img {
    max-height: 260px;
  }

  ${props => {
    if (props.hugeness === 'small') {
      return `
        min-height: 80px;
        font-size: 12px;
        padding: 10px 20px;
      `;
    } else {
      return `
        bottom: 0;
        top: 0;
        left: 0;
        right: 0;
        z-index: 0;
      `;
    }
  }};

  i {
    font-size: ${props => (props.hugeness === 'small' ? '28px' : '14vh')};
    line-height: ${props => (props.hugeness === 'small' ? '40px' : '18vh')};
    color: ${colors.colorCoreLightGray};
  }

  a {
    margin-top: 10px;
    align-self: center;
  }
`;

type Props = {
  text: string,
  icon?: string,
  image?: string,
  size?: string,
  linkUrl?: string,
  linkText?: string
};

function EmptyState({ text, icon, image, size = 'small', linkUrl, linkText }: Props) {
  return (
    <EmptyStateStyled hugeness={size}>
      {icon ? <Icon icon={icon} /> : <img src={image} alt={text} />}

      {__(text)}

      {linkUrl && linkText ? (
        <Button btnStyle="simple" size="small" href={linkUrl}>
          {linkText}
        </Button>
      ) : null}
    </EmptyStateStyled>
  );
}

export default EmptyState;
