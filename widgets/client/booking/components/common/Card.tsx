import * as React from 'react';
import { IStyle } from '../../types';

type Props = {
  title: string;
  style: IStyle;
  status?: string;
  count?: string;
  description?: string;
  isAnotherCardSelected?: boolean;
};

type State = {
  style: {};
  isSelected: boolean;
  isDisabled: boolean;
  isAnotherCardSelected?: boolean;
};

class Card extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    const count: string = this.props.count!;

    this.state = {
      isSelected: false,
      isDisabled: (this.props.status === 'disabled' || Number(count) === 0) ? true : false,
      style: {
        backgroundColor: this.props.style.productAvailable,
        color: '#fff',
        transition: 'all 0.2s'
      }
    };

  }

  onClick = () => {
    this.setState({
      isSelected: !this.state.isSelected
    });

    if (this.state.isSelected === true  && this.state.isDisabled === false) {
      this.setState({
        style: {
          backgroundColor: this.props.style.productSelected,
          color: '#fff',
          transition: 'all 0.2s'
        }
      });
    }

    if (this.state.isSelected === true) {
      this.setState({
        style: {
          backgroundColor: this.props.style.productAvailable,
          color: this.props.style.textAvailable,
          transition: "all 0.2s",
        }
      });
    }

  };

  render() {
    const disabledStyle = {
      pointEvents: "none",
      backgroundColor: this.props.style.productUnavailable,
      color: this.props.style.textUnavailable,
      transition: "all 0.2s"
    }

    const style  = this.state.isDisabled === true ? disabledStyle : this.state.style

    return (
      <div onClick={this.onClick} className={`card`} style={style} >
        <h4> {this.props.title} </h4>
        <p> {this.props.description} </p>
      </div>
    );
  }
}

export default Card;
