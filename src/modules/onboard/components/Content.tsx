import * as React from 'react';
import * as RTG from 'react-transition-group';
import { BrandAdd, Channel, UserAdd } from '../containers';
import { LeftContent } from './styles';

type Props = {
  activeStep: number;
  changeStep: () => void;
};

class Content extends React.PureComponent<Props> {
  renderContent() {
    const { activeStep } = this.props;

    return (
      <>
        <RTG.CSSTransition
          in={activeStep === 1}
          appear={true}
          timeout={500}
          classNames="slide-in"
          unmountOnExit={true}
        >
          <BrandAdd queryParams={{}} />
        </RTG.CSSTransition>

        <RTG.CSSTransition
          in={activeStep === 2}
          appear={true}
          timeout={500}
          classNames="slide-in"
          unmountOnExit={true}
        >
          <UserAdd queryParams={{}} />
        </RTG.CSSTransition>

        <RTG.CSSTransition
          in={activeStep === 3}
          appear={true}
          timeout={500}
          classNames="slide-in"
          unmountOnExit={true}
        >
          <Channel queryParams={{}} />
        </RTG.CSSTransition>
      </>
    );
  }
  render() {
    return <LeftContent>{this.renderContent()}</LeftContent>;
  }
}

export default Content;
