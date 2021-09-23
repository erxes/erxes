import * as React from 'react';

interface IState {
  activeRoute: string;
  activeBooking: null;
}

interface IStore extends IState {
  goToBooking: (booking: any) => void;
  goToIntro: () => void;
}

const AppContext = React.createContext({} as IStore);

export const AppConsumer = AppContext.Consumer;

export class AppProvider extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      activeRoute: 'INTRO',
      activeBooking: null
    };
  }

  goToBooking = (booking: any) => {
    this.setState({
      activeRoute: 'CATEGORY_DETAIL',
      activeBooking: booking
    });
  };

  goToIntro = () => {
    this.setState({
      activeRoute: 'INTRO',
      activeBooking: null
    });
  };

  render() {
    return (
      <AppContext.Provider
        value={{
          ...this.state,
          goToBooking: this.goToBooking,
          goToIntro: this.goToIntro
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
