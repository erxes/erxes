import React from 'react';

type State = {
  activeStep: number;
};

interface IState {
  activeStep: number;
}

interface IStore extends IState {
  changeStep: (increase: boolean) => void;
  goStep: (activeStep: number) => void;
}

const OnboardContext = React.createContext({} as IStore);

export const OnboardConsumer = OnboardContext.Consumer;

export class OnboardProvider extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props);

    this.state = {
      activeStep: 1
    };

    this.changeStep = this.changeStep.bind(this);
    this.goStep = this.goStep.bind(this);
  }

  changeStep(increase: boolean = true) {
    const { activeStep } = this.state;

    if (increase) {
      return this.setState({ activeStep: activeStep + 1 });
    }

    return this.setState({ activeStep: activeStep - 1 });
  }

  goStep(activeStep: number) {
    this.setState({ activeStep });
  }

  render() {
    const { activeStep } = this.state;

    return (
      <OnboardContext.Provider
        value={{
          activeStep,
          changeStep: this.changeStep,
          goStep: this.goStep
        }}
      >
        {this.props.children}
      </OnboardContext.Provider>
    );
  }
}
