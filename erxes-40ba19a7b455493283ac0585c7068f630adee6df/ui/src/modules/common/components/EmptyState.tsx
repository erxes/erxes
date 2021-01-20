import { __ } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '../styles';
import Icon from './Icon';

const EmptyStateStyled = styledTS<{ hugeness: string; light?: boolean }>(
  styled.div
)`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 14px;
  padding: 20px;
  color: ${colors.colorCoreGray};

  img {
    max-height: 260px;
    margin: 0 auto 20px auto;
    max-width: 60%;
    width: fit-content;
  }

  span {
    max-width: 600px;
    color: ${props => props.light && colors.colorWhite};
  }

  ${props => {
    if (props.hugeness === 'small') {
      return `
        min-height: 100px;
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

  > i {
    font-size: ${props => (props.hugeness === 'small' ? '28px' : '12vh')};
    line-height: ${props => (props.hugeness === 'small' ? '40px' : '18vh')};
    color: ${colors.colorCoreLightGray};
  }

  a, button {
    align-self: center;
  }
`;

const ExtraContent = styled.div`
  margin-top: 15px;

  > a {
    margin-right: 10px;

    &:last-child {
      margin: 0;
    }
  }
`;

type Props = {
  text: string;
  icon?: string;
  image?: string;
  size?: string;
  extra?: React.ReactNode;
  light?: boolean;
};

function EmptyState({
  text,
  icon,
  image,
  size = 'small',
  extra,
  light
}: Props) {
  return (
    <EmptyStateStyled hugeness={size} light={light}>
      {icon ? <Icon icon={icon} /> : <img src={image} alt={text} />}

      <span>{__(text)}</span>
      {extra && <ExtraContent>{extra}</ExtraContent>}
    </EmptyStateStyled>
  );
}

export default EmptyState;
