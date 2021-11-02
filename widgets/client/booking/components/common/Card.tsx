import * as React from "react";
import { IStyle } from "../../types";

type Props = {
  title: string;
  style: IStyle;
  onClick: () => void;
  status?: string;
  count?: string;
  description?: string;
};

type State = {
  style: {};
  isDisabled: boolean;
};

class Card extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);

    const count: string = props.count!;

    this.state = {
      isDisabled:
        props.status === "disabled" || parseInt(count, 10) === 0 ? true : false,
      style: {
        borderColor: props.style.productAvailable,
        color: props.style.productAvailable,
      },
    };
  }

  render() {
    const { isDisabled, style } = this.state;
    const { title, description, onClick } = this.props;

    return (
      <div
        onClick={() => onClick()}
        className={`card ${isDisabled ? "disabled" : ""}`}
        style={style}
      >
        <h4>{title} </h4>
        {description && <p> {description} </p>}
      </div>
    );
  }
}

export default Card;
