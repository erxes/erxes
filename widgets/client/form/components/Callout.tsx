import * as React from "react";
import { AppConsumer } from "../../messenger/containers/AppContext";
import { readFile } from "../../utils";
import { ICallout } from "../types";
import TopBar from "./TopBar";

type Props = {
  onSubmit: (e: React.FormEvent<HTMLButtonElement>) => void;
  setHeight?: () => void;
  configs: ICallout;
  color: string;
  hasTopBar?: boolean;
};

class Callout extends React.Component<Props> {
  componentDidMount() {
    if (this.props.setHeight) {
      this.props.setHeight();
    }
  }

  renderFeaturedImage(image: string, title: string) {
    if (!image) {
      return null;
    }

    return (
      <img onLoad={this.props.setHeight} src={readFile(image)} alt={title} />
    );
  }

  renderHead(title: string) {
    const { hasTopBar, color } = this.props;

    if (hasTopBar) {
      return <TopBar title={title} color={color} />;
    }

    return <h4>{title}</h4>;
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
        {this.renderHead(title)}

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

export default (props: Props) => (
  <AppConsumer>
    {({ getColor }) => {
      return (
        <Callout
          {...props}
          // if lead is in a messenger, return messenger theme color (getColor())
          // else return lead theme color
          color={getColor ? getColor() : props.color}
        />
      );
    }}
  </AppConsumer>
);
