import React, { useRef } from "react";

import { CSSTransition } from "react-transition-group";
import { RightDrawerContainer } from "../styles";

type Props = {
  showDrawer: boolean;
  form?: any;
};

const Form = (props: Props) => {
  const { showDrawer, form, } = props;

  const Form = form;

  const wrapperRef = useRef<any>(null);


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
