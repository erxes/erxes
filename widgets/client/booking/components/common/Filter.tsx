import * as React from 'react';
import Button from './Button';
import { IBookingData } from '../../types';

type Props = {
  booking?: IBookingData;
};

type State = {
  isOpen: boolean;
  selectedOption: any;
};



class Filter extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isOpen: false,
      selectedOption: null
    };
  }

  toggleNavigation = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }));
  };

  handleChange = (selectedOption: any) => {
    this.setState({ selectedOption }, () =>
      console.log(`Option selected:`, this.state.selectedOption)
    );
  };
  render() {
    const { booking } = this.props;

    if (!booking) {
      return null;
    }

    return (
      <div> dnfkjsa</div>
    );
  }
}


export default Filter;
