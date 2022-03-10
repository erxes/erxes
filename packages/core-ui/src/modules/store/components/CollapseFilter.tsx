import React, { useState } from "react";
import Collapse from "react-bootstrap/Collapse";
import styled, { css } from "styled-components";
import styledTS from "styled-components-ts";
import colors from "@erxes/ui/src/styles/colors";
import Icon from "@erxes/ui/src/components/Icon";

const Title = styledTS<{
  compact?: boolean;
  hasImage?: boolean;
  background?: string;
}>(styled.a)`
  padding: ${(props) => (props.compact ? "10px 10px" : "10px")};
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  color: ${colors.textSecondary};

  h4 {
    font-weight: 500;
    margin: 0;
  }

  &:hover {
    cursor: pointer;
  }

  ${(props) =>
    props.hasImage &&
    css`
      &:after {
        content: "";
        display: block;
        position: absolute;
        width: 300px;
        height: 200%;
        background-color: ${colors.colorWhite};
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

const Container = styledTS<{ open: boolean; border?: boolean }>(styled.div)`
  margin-bottom: 10px;
  background: ${colors.colorWhite};
  padding: '12px';
  border-bottom: 1px solid ${(props) => props.border ? colors.borderDarker : colors.colorWhite};

  &:last-child {
    margin-bottom: 0;
  }

  > ${Title} i {
    font-size: 20px;
    transition: transform ease 0.3s;
    transform: ${(props) => props.open && "rotate(180deg)"};
  }
`;

const Content = styledTS<{ full: boolean }>(styled.div)`
  background: ${colors.colorWhite};
  padding: ${(props) => (props.full ? "0" : "12px")};

  ${Container} {
    background: ${colors.colorWhite};
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
  id?: string;
  hasBorder?: boolean;
};

function CollapseFilter(props: Props) {
  const [open, toggleCollapse] = useState<boolean>(props.open || false);

  const onClick = () => {
    toggleCollapse(!open);
    if (props.onClick) {
      props.onClick();
    }
  };
  const hasImage = props.image ? true : false;
  const hasBorder = props.hasBorder ? true : false;

  return (
    <Container open={open} id={props.id} border={hasBorder}>
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
            <b>{props.title}</b>
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

export default CollapseFilter;
