import React, { useState } from 'react';
import Collapse from 'react-bootstrap/Collapse';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { rgba } from '../styles/color';
import colors from '../styles/colors';
import Icon from './Icon';

const Title = styledTS<{
  compact?: boolean;
  hasImage?: boolean;
  background?: string;
}>(styled.a)`
  padding: ${props => (props.compact ? '10px 20px' : '20px')};
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  color: ${colors.textPrimary};

  h4 {
    font-weight: 500;
    margin: 0;
  }

  &:hover {
    cursor: pointer;
  }

  ${props =>
    props.hasImage &&
    css`
      &:after {
        content: '';
        display: block;
        position: absolute;
        border-radius: 100% 12%;
        width: 300px;
        height: 200%;
        background-color: ${rgba(props.background, 0.13)};
        right: -40px;
        top: -30px;
      }

      img {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        height: 100%;
        max-width: 40%;
        padding: 10px 10px 0 10px;
        z-index: 2;
      }
    `};
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Container = styledTS<{ open: boolean }>(styled.div)`
  margin-bottom: 10px;
  box-shadow: 0 0 6px 1px rgba(0,0,0,0.08);
  border-radius: 4px;
  background: ${props => (props.open ? colors.bgLight : colors.colorWhite)};

  &:last-child {
    margin-bottom: 0;
  }

  > ${Title} i {
    font-size: 20px;
    transition: transform ease 0.3s;
    transform: ${props => props.open && 'rotate(180deg)'};
  }
`;

const Content = styledTS<{ full: boolean }>(styled.div)`
  padding: ${props => (props.full ? '0' : '20px')};
  border-top: 1px solid ${colors.borderPrimary};
  background: ${colors.colorWhite};
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;

  ${Container} {
    box-shadow: none;
    border-radius: 0;
    background: ${colors.colorWhite};
    border-bottom: 1px solid ${colors.borderPrimary};
    margin: 0;
  }
`;

type Props = {
  contendId?: string;
  title: string;
  children: React.ReactNode;
  description?: React.ReactNode;
  open?: boolean;
  compact?: boolean;
  image?: string;
  beforeTitle?: React.ReactNode;
  onClick?: () => void;
  imageBackground?: string;
};

function CollapseContent(props: Props) {
  const [open, toggleCollapse] = useState<boolean>(props.open || false);

  const onClick = () => {
    toggleCollapse(!open);
    if (props.onClick) {
      props.onClick();
    }
  };
  const hasImage = props.image ? true : false;

  return (
    <Container open={open}>
      <Title
        href={props.contendId && `#${props.contendId}`}
        id={props.contendId}
        onClick={onClick}
        compact={props.compact}
        hasImage={hasImage}
        background={props.imageBackground}
      >
        <Left>
          {props.beforeTitle}
          <div>
            <h4>{props.title}</h4>
            {props.description}
          </div>
        </Left>
        {hasImage ? (
          <img alt="heading" src={props.image} />
        ) : (
          <Icon icon="angle-down" />
        )}
      </Title>
      <Collapse in={open}>
        <div>
          <Content full={hasImage}>{props.children}</Content>
        </div>
      </Collapse>
    </Container>
  );
}

export default CollapseContent;
