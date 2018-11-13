import * as React from "react";
import { ICallout } from "../types";
import { TopBar } from "./";

type Props = {
  onSubmit: (e: React.FormEvent<HTMLButtonElement>) => void;
  setHeight: () => void;
  configs: ICallout;
  color: string;
};

class Callout extends React.Component<Props> {
  componentDidMount() {
    this.props.setHeight();
  }

  renderFeaturedImage(image: string, title: string) {
    if (!image) {
      return null;
    }

    return <img onLoad={this.props.setHeight} src={image} alt={title} />;
  }

  render() {
    const { configs, onSubmit, color } = this.props;
    const defaultConfig = {
      skip: false,
      title: "",
      buttonText: "",
      body: "",
      featuredImage: ""
    };
    const { skip, title = "", buttonText, body, featuredImage = "" } =
      configs || defaultConfig;

    if (skip) {
      return null;
    }

    return (
      <div className="erxes-form">
        <TopBar title={title} color={color} />

        <div className="erxes-form-content">
          <div className="erxes-callout-body">
            {this.renderFeaturedImage(featuredImage, title)}
            {body}
          </div>
          <button
            style={{ background: color }}
            type="button"
            className="erxes-button btn-block"
            onClick={onSubmit}
          >
            {buttonText}
          </button>
        </div>
      </div>
    );
  }
}

export default Callout;
