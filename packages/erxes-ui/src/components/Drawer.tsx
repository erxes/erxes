import React, { useState } from "react";

import Button from "./Button";
import { CSSTransition } from "react-transition-group";
import { colors } from "../styles";
import styled from "styled-components";
import styledTS from "styled-components-ts";

type Props = {
  children: any;
  title: string;
  side?: "right" | "left" | "bottom" | "top";
  icon?: string;
  width?: number;
  height?: number;
  btnStyle?: string;
};

const Drawer: React.FC<Props> = ({
  children,
  title,
  icon,
  btnStyle,
  side = "right",
  width = 20,
  height = 25
}) => {
  const [visible, setVisible] = useState("none");
  const [show, setShow] = useState(false);

  const showDrawer = () => {
    if (visible === "none") {
      setVisible("flex");
      setShow(!show);
    }

    setVisible("none");
    setShow(!show);
  };

  const DrawerOverlay = styledTS(styled.div)`
    position: fixed;
    z-index: 100;
    height: 100vh;
    width: 100vw;
    top: 0;
    right: 0;
    background: rgba(0,0,0,.4);
    display: ${show ? "block" : "none"};
    transition: all ease .3s;
`;

  const DrawerContainer = styledTS(styled.div)`
    display: flex;
    justify-content: ${side === "right" || side === "left" ? "flex-end" : "flex-start"};
    align-items: ${side === "right" || side === "left" ? "flex-start" : "flex-end"};
    flex-direction: ${side === "right" || side === "left" ? "row" : "column"};
`;

  const DrawerContent = styledTS(styled.div)`
    display: block;
    background-color: ${colors.bgLight};
    position: fixed;
    z-index: 200;
    white-space: normal;
    overflow: hidden;
    height: ${side === "right" || side === "left" ? "100vh" : height + "vh"};
    width: ${side === "right" || side === "left" ? width + "vw" : "96vw"};
    flex-direction: ${side === "bottom" || side === "top" ? "column" : "row"}; 
    margin-left: ${side === "right" ? "0" : "70px"};
    ${side === "right" ? "right: 0;" : "left: 0;"}
    ${side === "bottom" ? "bottom: 0;" : "top: 0;"}
    box-shadow: 4px 0px 15px 0px ${colors.colorCoreGray};
`;

  return (
    <DrawerContainer>
      <Button
        btnStyle={btnStyle || "simple"}
        icon={icon}
        onClick={() => showDrawer()}
      >
        {title}
      </Button>
      <DrawerOverlay onClick={() => showDrawer()} />
      <CSSTransition
        appear={true}
        in={show}
        timeout={300}
        classNames={`slide-in-${side}`}
        unmountOnExit={true}
      >
        <DrawerContent>{children(setShow)}</DrawerContent>
      </CSSTransition>
    </DrawerContainer>
  );
};

export default Drawer;
