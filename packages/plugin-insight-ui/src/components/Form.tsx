import React, { useRef, useState } from "react";

import { CSSTransition } from "react-transition-group";
import { RightDrawerContainer } from "../styles";

type Props = {
  showDrawer: boolean;
  setShowDrawer(showDrawer: boolean): void;
  renderForm(form?: any): void;
  form?: any;
};

const Form = (props: Props) => {
  const { showDrawer, setShowDrawer, form, renderForm } = props;

  const Form = form;

  const wrapperRef = useRef<any>(null);

  const closeDrawer = () => {
    renderForm(null);
  };

  return (
    <div ref={wrapperRef}>
      <CSSTransition
        in={showDrawer}
        timeout={300}
        classNames="slide-in-right"
        unmountOnExit={true}
      >
        <RightDrawerContainer>{form ? <Form /> : <></>}</RightDrawerContainer>
      </CSSTransition>
    </div>
  );
};

export default Form;
