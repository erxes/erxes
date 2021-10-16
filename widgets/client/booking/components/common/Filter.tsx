import * as React from 'react';
import Select from 'react-select';
import * as ReactPopover from 'react-popover';
import Button from './Button';
import { IBookingData } from '../../types';

type Props = {
  booking?: IBookingData;
};

type State = {
  isOpen: boolean;
  selectedOption: any;
};

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
];

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

    const styles = booking.style;
    const { isOpen } = this.state;

    return (
      <ReactPopover
        isOpen={isOpen}
        tipSize={0.01}
        preferPlace={'start'}
        place={'above'}
        body={
          <div className={`booking-navigation filter bn-${styles.widgetColor}`}>
            <div className="flex-sb p-5">
              <div className="b"> Filter by</div>
              <div
                onClick={() => {
                  this.setState({ isOpen: false });
                }}
              />
            </div>

            {/* <Select value={this.state.selectedOption} onChange={() => this.handleChange} options={options} /> */}
            {/* <Select value={this.state.selectedOption} onChange={() => this.handleChange} options={options} />
                <Select value={this.state.selectedOption} onChange={() => this.handleChange} options={options} />  */}

            <Button
              color={booking.style.widgetColor}
              text={'Save'}
              onClickHandler={() => alert('saved')}
            />
          </div>
        }
      >
        <div onClick={this.toggleNavigation}>
          <div className="flex-end mr-10">
            <p>Filter</p>
          </div>
        </div>
      </ReactPopover>
    );
  }
}

const Burger = () => {
  return (
    <div className="burger-menu">
      <div />
      <div />
      <div />
    </div>
  );
};

export default Filter;
