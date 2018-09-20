import {
  ControlLabel,
  FormControl,
  FormGroup
} from "modules/common/components";
import { LeftItem, Preview } from "modules/common/components/step/styles";
import React, { Component } from "react";
import { IFormData } from "../../../settings/integrations/types";
import { IFormField } from "../../types";
import { SuccessPreview } from "./preview";
import { FlexItem } from "./style";

type Props = {
  type: string;
  color: string;
  theme: string;
  thankContent?: string;
  successAction?: string;
  onChange: (name: string, value: IFormField[] | string | boolean) => void;
  formData?: IFormData;
};

type State = {
  successAction?: string;
};

class SuccessStep extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const formData = props.formData || {};

    this.state = {
      successAction: formData.successAction || "onPage"
    };

    this.onChangeFunction = this.onChangeFunction.bind(this);
    this.handleSuccessActionChange = this.handleSuccessActionChange.bind(this);
  }

  handleSuccessActionChange() {
    const element = document.getElementById(
      "successAction"
    ) as HTMLInputElement;
    const value = element.value;

    this.setState({ successAction: value });
    this.props.onChange("successAction", value);
  }

  onChangeFunction(name: string, value: string) {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
  }

  renderEmailFields(formData: IFormData) {
    if (this.state.successAction !== "email") return null;

    return (
      <div>
        <FormGroup>
          <ControlLabel>From email</ControlLabel>
          <FormControl
            type="text"
            id="fromEmail"
            defaultValue={formData.fromEmail}
            onChange={(e: React.FormEvent<HTMLElement>) =>
              this.onChangeFunction("fromEmail", (e.currentTarget as HTMLInputElement).value)
            }
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>User email title</ControlLabel>
          <FormControl
            type="text"
            id="userEmailTitle"
            defaultValue={formData.userEmailTitle}
            onChange={(e: React.FormEvent<HTMLElement>) =>
              this.onChangeFunction("userEmailTitle", (e.currentTarget as HTMLInputElement).value)
            }
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>User email content</ControlLabel>
          <FormControl
            componentClass="textarea"
            type="text"
            defaultValue={formData.userEmailContent}
            id="userEmailContent"
            onChange={(e: React.FormEvent<HTMLElement>) =>
              this.onChangeFunction("userEmailContent", (e.currentTarget as HTMLInputElement).value)
            }
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Admin emails</ControlLabel>
          <FormControl
            id="adminEmails"
            type="text"
            defaultValue={formData.adminEmails ? formData.adminEmails.join(",") : []}
            onChange={(e: React.FormEvent<HTMLElement>) =>
              this.onChangeFunction("adminEmails", (e.currentTarget as HTMLInputElement).value)
            }
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Admin email title</ControlLabel>
          <FormControl
            type="text"
            defaultValue={formData.adminEmailTitle}
            id="adminEmailTitle"
            onChange={(e: React.FormEvent<HTMLElement>) =>
              this.onChangeFunction("adminEmailTitle", (e.currentTarget as HTMLInputElement).value)
            }
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Admin email content</ControlLabel>
          <FormControl
            componentClass="textarea"
            type="text"
            defaultValue={formData.adminEmailContent}
            id="adminEmailContent"
            onChange={(e: React.FormEvent<HTMLElement>) =>
              this.onChangeFunction("adminEmailContent", (e.currentTarget as HTMLInputElement).value)
            }
          />
        </FormGroup>
      </div>
    );
  }

  renderRedirectUrl(formData) {
    if (this.state.successAction !== "redirect") return null;

    return (
      <div>
        <FormGroup>
          <ControlLabel>Redirect url</ControlLabel>
          <FormControl
            type="text"
            defaultValue={formData.redirectUrl}
            id="redirectUrl"
            onChange={(e: React.FormEvent<HTMLElement>) =>
              this.onChangeFunction("redirectUrl", (e.currentTarget as HTMLInputElement).value)
            }
          />
        </FormGroup>
      </div>
    );
  }

  renderThankContent() {
    const { thankContent } = this.props;
    const { successAction } = this.state;

    if (successAction !== "onPage") return null;

    return (
      <FormGroup>
        <ControlLabel>Thank content</ControlLabel>
        <FormControl
          id="thankContent"
          type="text"
          componentClass="textarea"
          defaultValue={thankContent}
          onChange={(e: React.FormEvent<HTMLElement>) =>
            this.onChangeFunction("thankContent", (e.currentTarget as HTMLInputElement).value)
          }
        />
      </FormGroup>
    );
  }

  render() {
    const formData = this.props.formData || {};
    const { successAction } = this.state;

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>On success</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={successAction}
              onChange={this.handleSuccessActionChange}
              id="successAction"
            >
              <option />
              <option>email</option>
              <option>redirect</option>
              <option>onPage</option>
            </FormControl>
          </FormGroup>

          {this.renderEmailFields(formData)}
          {this.renderRedirectUrl(formData)}
          {this.renderThankContent()}
        </LeftItem>

        <Preview>
          <SuccessPreview {...this.props} />
        </Preview>
      </FlexItem>
    );
  }
}

export default SuccessStep;
