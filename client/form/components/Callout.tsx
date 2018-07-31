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

  render() {
    const { configs, onSubmit, color } = this.props;

    const defaultConfig = { skip: false, title: "", buttonText: "", body: "" };
    const { skip, title = "", buttonText, body } = configs || defaultConfig;

    if (skip) {
      return null;
    }

    return (
      <div className="erxes-form">
        <TopBar title={title} color={color} />

        <div className="erxes-form-content">
          <div className="erxes-callout-body">{body}</div>
          <button
            style={{ background: color }}
            type="button"
            className="btn btn-block"
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
