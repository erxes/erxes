import * as React from 'react';
import { IBooking, IProductCategory } from '../types';

interface IState {
  activeRoute: string;
  activeBooking: IBooking | null;
  activeBlock: string | null;
}

interface IStore extends IState {
  goToIntro: () => void;
  goToBooking: (booking: any) => void;
  goToBookings: () => void;
  goToBlock: (blockId: string) => void;
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

  goToBookings = () => {
    this.setState({
      activeRoute: 'BOOKING',
      activeBlock: null
    });
  };

  goToBlock = (blockId: any) => {
    this.setState({
      activeRoute: 'BLOCK_DETAIL',
      activeBlock: blockId
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
          goToBlock: this.goToBlock,
          goToBookings: this.goToBookings
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
