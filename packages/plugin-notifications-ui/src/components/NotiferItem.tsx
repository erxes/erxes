import React, { useEffect, useState } from "react";

import { CSSTransition } from "react-transition-group";
import Icon from "@erxes/ui/src/components/Icon";
import { Item } from "@erxes/ui-notifications/src/components/styles";
import debounce from "lodash/debounce";
import styled from "styled-components";

const Close = styled.div`
  position: absolute;
  right: 10px;
  top: 5px;
  font-size: 16px;
  transition: transform 0.2s ease;

  &:hover {
    cursor: pointer;
    transform: scale(1.1);
  }
`;

type Props = {
  children: React.ReactNode;
  closable?: boolean;
  background?: string;
  delay?: number;
};

const NotiferItem = (props: Props) => {
  const { children, closable, background, delay = 1000 } = props;

  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    debounce(() => setShow(true), delay)();
  }, []);

  const handleClose = () => {
    setShow(false);
  };

  return (
    <CSSTransition
      in={show}
      appear={true}
      timeout={500}
      classNames="slide-in-small"
      unmountOnExit={true}
    >
      <Item background={background}>
        {closable && (
          <Close onClick={handleClose}>
            <Icon icon="times" />
          </Close>
        )}
        {children}
      </Item>
    </CSSTransition>
  );
};

export default NotiferItem;
