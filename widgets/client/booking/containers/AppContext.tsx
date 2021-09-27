import * as React from 'react';
import { IBooking, IProductCategory } from '../types';

interface IState {
  activeRoute: string;
  activeBooking: IBooking | null;
  activeBlock: IProductCategory | null;
}

interface IStore extends IState {
  goToIntro: () => void;
  goToBooking: (booking: any) => void;
  goToBlock: (block: any) => void;
}

const AppContext = React.createContext({} as IStore);

export const AppConsumer = AppContext.Consumer;

export class AppProvider extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      activeRoute: 'INTRO',
      activeBooking: null,
      activeBlock: null
    };
  }

  goToIntro = () => {
    this.setState({
      activeRoute: 'INTRO',
      activeBooking: null
    });
  };

  goToBooking = (booking: any) => {
    this.setState({
      activeRoute: 'BOOKING',
      activeBooking: booking
    });
  };

  goToBlock = (block: any) => {
    this.setState({
      activeRoute: 'BLOCK_DETAIL',
      activeBlock: block
    });
  };

  render() {
    console.log(this.state.activeRoute);
    return (
      <AppContext.Provider
        value={{
          ...this.state,
          goToBooking: this.goToBooking,
          goToIntro: this.goToIntro,
          goToBlock: this.goToBlock
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
