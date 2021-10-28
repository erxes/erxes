import * as React from 'react';
import { IStyle } from '../../types';

type Props = {
  title: string;
  style: IStyle;
  status?: string;
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
      isAnotherCardSelected: false,
      style: {
        borderColor: this.props.style.productAvailable,
        backgroundColor: "#fff",
        color: this.props.style.textAvailable,
        transition: "all 0.2s",
      }
    };
  }

  onMouseEnter = () => {
    if (this.state.isSelected === false) {
      this.setState({
        style: {
          borderColor: this.props.style.productAvailable,
          backgroundColor: this.props.style.productAvailable,
          color: "#fff",
          transition: "all 0.2s",
        }
      });
    }
  };

  onMouseLeave = () => {
    if (this.state.isSelected === false) {
      this.setState({
        style: {
          borderColor: this.props.style.productAvailable,
          backgroundColor: "#fff",
          color: this.props.style.textAvailable,
          transition: "all 0.2s",
        }
      });
    }
  }

  onClick = () => {
    this.setState({
      isSelected: !this.state.isSelected,
      style: {
        borderColor: this.props.style.productSelected,
        backgroundColor: this.props.style.productSelected,
        color: "#fff",
        transition: "all 0.2s",
      }
    });
  }

  render() {
    if (this.props.isAnotherCardSelected === true) {
      this.setState({
        isSelected: false,
        style: {
          borderColor: this.props.style.productAvailable,
          backgroundColor: "#fff",
          color: this.props.style.textAvailable,
          transition: "all 0.2s",
        }
      })
    }

    return (
      <div onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} onClick={this.onClick} className={`card card-${this.props.status}`} style={this.state.style} >
        <h4> {this.props.title} </h4>
        <p> {this.props.description} </p>
      </div>
    );
  }

}

export default Card;
