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
  isAnotherCardSelected?: boolean;
};

class Card extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      isSelected: false,
      style: {
        backgroundColor: this.props.style.productAvailable,
        color: "#fff",
        transition: "all 0.2s",
      }
    };
  }

  onClick = () => {
    if (this.state.isSelected === false) {
      this.setState({
        style: {
          backgroundColor: this.props.style.productSelected,
          color: "#fff",
          transition: "all 0.2s",
        }
      })
    }

    if (this.state.isSelected === true) {
      this.setState({
        style: {
          backgroundColor: this.props.style.productAvailable,
          color: this.props.style.textAvailable,
          transition: "all 0.2s",
        }
      })
    }
    this.setState({
      isSelected: !this.state.isSelected,
    });
  }

  render() {

    const count: string = this.props.count!;
    const status = (this.props.status === "disabled" || parseInt(count) === 0) ? "disabled" : ""

    const disabledStyle = {
      pointEvents: "none",
      backgroundColor: this.props.style.productUnavailable,
      color: this.props.style.textUnavailable,
      transition: "all 0.2s"
    }

    return (
      <div onClick={this.onClick} className={`card ${status === "disabled" ? disabledStyle : ""}`} style={this.state.style} >
        <h4> {this.props.title} </h4>
        <p> {this.props.description} </p>
      </div>
    );
  }

}

export default Card;
