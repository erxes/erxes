import React, { useRef, useState } from 'react';
import RTG from 'react-transition-group';
import { RightDrawerContainer } from '../styles';

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
      <RTG.CSSTransition
        in={showDrawer}
        timeout={300}
        classNames="slide-in-right"
        unmountOnExit={true}
      >
        <RightDrawerContainer>{form ? <Form /> : <></>}</RightDrawerContainer>
      </RTG.CSSTransition>
    </div>
  );
};

export default Form;
