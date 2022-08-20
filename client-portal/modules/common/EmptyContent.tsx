import React from "react";
import styled from "styled-components";
import Icon from "./Icon";

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  img {
    max-height: 260px;
    margin: 0 auto 30px auto;
    max-width: 60%;
    width: fit-content;
  }

  span {
    max-width: 600px;
    font-size: 14px;
  }
`;

type Props = {
  text: string;
  icon?: string;
  image?: string;
};

const EmptyContent = (props: Props) => {
  const { icon, text, image = "/static/5.svg" } = props;

  return (
    <Content>
      {icon ? <Icon icon={icon} /> : <img src={image} alt={text} />}
      <span>{text}</span>
    </Content>
  );
};

export default EmptyContent;
