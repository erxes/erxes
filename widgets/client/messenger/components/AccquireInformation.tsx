import * as classNames from "classnames";
import * as React from "react";
import { iconRight } from "../../icons/Icons";
import { __ } from "../../utils";
import { TopBar } from "../containers";

type Props = {
  save: (doc: State) => void;
  color?: string;
  loading: boolean;
  showTitle?: boolean;
};

type State = {
  type: string;
  value: string;
  isLoading: boolean;
  isValidated: boolean;
};

class AccquireInformation extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      type: "email",
      value: "",
      isValidated: true,
      isLoading: props.loading
    };

    this.save = this.save.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.loading !== this.props.loading) {
      this.setState({ isLoading: nextProps.loading });
    }
  }

  onTypeChange(type: string) {
    this.setState({ type });
  }

  onValueChange(e: React.FormEvent<HTMLInputElement>) {
    this.setState({ value: e.currentTarget.value, isValidated: true });
  }

  isPhoneValid(phoneNumber: string) {
    const reg = /^\d{8,}$/;
    return reg.test(phoneNumber.replace(/[\s()+\-\.]|ext/gi, ""));
  }

  isEmailValid(email: string) {
    const reg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+[^<>()\.,;:\s@\"]{2,})$/;
    return reg.test(email);
  }

  save(e: React.FormEvent) {
    e.preventDefault();

    const { value, type } = this.state;

    if (
      (type === "email" && this.isEmailValid(value)) ||
      this.isPhoneValid(value)
    ) {
      return this.props.save(this.state);
    }

    return this.setState({ isValidated: false });
  }

  renderTitle() {
    if (!this.props.showTitle) {
      return null;
    }

    const title = (
      <div className="erxes-topbar-title">
        <div>{__("Contact")}</div>
        <span>{__("Please leave your contact details to start a conversation")}.</span>
      </div>
    );

    return <TopBar middle={title} />;
  }

  render() {
    const { color } = this.props;
    const { type, isValidated, isLoading } = this.state;
    const formClasses = classNames("form", { invalid: !isValidated });

    const placeholder =
      type === "email" ? __("email@domain.com") : __("phone number");

    return (
      <>
        {this.renderTitle()}
        <div className="accquire-information slide-in">
          <p className="type">
            <span
              className={type === "email" ? "current" : ""}
              onClick={() => this.onTypeChange("email")}
              style={{ borderColor: color }}
            >
              {__("Email")}
            </span>

            <span
              className={type === "phone" ? "current" : ""}
              onClick={() => this.onTypeChange("phone")}
              style={{ borderColor: color }}
            >
              {__("SMS")}
            </span>
          </p>

          <form className={formClasses} onSubmit={this.save}>
            <input
              onChange={this.onValueChange}
              placeholder={placeholder ? placeholder.toString() : ""}
              type={type === "email" ? "text" : "tel"}
              autoFocus={true}
            />

            <button
              onClick={this.save}
              type="submit"
              style={{ backgroundColor: color }}
            >
              {isLoading ? <div className="loader" /> : iconRight}
            </button>
          </form>
        </div>
      </>
    );
  }
}

export default AccquireInformation;
