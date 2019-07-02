import React from 'react';
import RTG from 'react-transition-group';
import { BrandAdd, Channel, MessengerAdd, UserAdd } from '../containers';

type Props = {
  activeStep: number;
};

function WithTransition(props: {
  active: number;
  current: number;
  children: React.ReactNode;
}) {
  const { children, active, current } = props;

  return (
    <RTG.CSSTransition
      in={active === current}
      appear={true}
      timeout={500}
      classNames="slide-in"
      unmountOnExit={true}
    >
      {children}
    </RTG.CSSTransition>
  );
}

class Content extends React.PureComponent<Props> {
  render() {
    const { activeStep } = this.props;

    return (
      <>
        <WithTransition active={activeStep} current={1}>
          <BrandAdd />
        </WithTransition>

        <WithTransition active={activeStep} current={2}>
          <UserAdd />
        </WithTransition>

        <WithTransition active={activeStep} current={3}>
          <MessengerAdd />
        </WithTransition>

        <WithTransition active={activeStep} current={4}>
          <Channel />
        </WithTransition>
      </>
    );
  }
}

export default Content;
