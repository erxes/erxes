import * as React from 'react';
import * as RTG from 'react-transition-group';
import { BrandAdd, Channel, MessengerAdd, UserAdd } from '../containers';
import { LeftContent } from './styles';

type Props = {
  activeStep: number;
  changeStep: () => void;
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
    const { activeStep, changeStep } = this.props;

    return (
      <>
        <WithTransition active={activeStep} current={1}>
          <BrandAdd queryParams={{}} changeStep={changeStep} />
        </WithTransition>

        <WithTransition active={activeStep} current={2}>
          <UserAdd queryParams={{}} changeStep={changeStep} />
        </WithTransition>

        <WithTransition active={activeStep} current={3}>
          <MessengerAdd queryParams={{}} />
        </WithTransition>

        <WithTransition active={activeStep} current={4}>
          <Channel queryParams={{}} />
        </WithTransition>
      </>
    );
  }
}

export default Content;
