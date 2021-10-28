import * as React from 'react';
import { IStyle } from '../../types';

type Props = {
  title: string;
  key: any;
  type: string;
  style: IStyle;
  status?: string;
  description?: string;
  goTo?: () => void;
};

type State = {
  style: {};
};

class Card extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      style: {
        borderColor: "",
        color: "",
        boxShadow: "",
        transition: "all 0.5s",
      }
    };
  }

  onMouseEnter = () => {
    this.setState({
      style: {
        borderColor: this.props.style.productAvailable,
        boxShadow: "none",
        color: this.props.style.widgetColor
      }
    });
  };

  onMouseLeave = () => {
    this.setState({
      style: {
        borderColor: "",
        boxShadow: "",
        transition: "all 0.5s",
        color: ""
      }
    });
  }

  onClick = () => {
    this.setState({
      style: {
        borderColor: this.props.style.productSelected,
        boxShadow: "",
        transition: "all 0.5s",
        color: this.props.style.textSelected
      }
    });
  }

  render() {
    return (
      <div onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} className={`card`} style={this.state.style} >
        <h4> {this.props.title} </h4>
        <p> {this.props.description} </p>
      </div>
    );
  }

}

export default Card;
