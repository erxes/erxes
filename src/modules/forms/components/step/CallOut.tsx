import {
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from "modules/common/components";
import { LeftItem, Preview } from "modules/common/components/step/styles";
import { __ } from "modules/common/utils";
import { uploadHandler } from "modules/common/utils";
import { ActionBar } from "modules/layout/components";
import { IField } from "modules/settings/properties/types";
import * as React from 'react';
import { CalloutPreview } from "./preview";
import { FlexColumn, FlexItem, ImageContent } from "./style";

const defaultValue = {
  isSkip: false
};

type Props = {
  type: string;
  onChange: (name: string, value: IField[] | string | boolean) => void;
  calloutTitle?: string;
  calloutBtnText?: string;
  bodyValue?: string;
  color: string;
  theme: string;
  image?: string;
  skip?: boolean;
};

type State = {
  logo?: string;
  logoPreviewStyle?: { opacity?: string };
  defaultValue: { [key: string]: boolean };
  logoPreviewUrl?: string;
};

class CallOut extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      logo: "",
      logoPreviewStyle: {},
      defaultValue
    };

    this.onChangeFunction = this.onChangeFunction.bind(this);
    this.onChangeState = this.onChangeState.bind(this);
    this.footerActions = this.footerActions.bind(this);
    this.handleImage = this.handleImage.bind(this);
    this.removeImage = this.removeImage.bind(this);
  }

  onChangeFunction(name: any, value: string) {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
  }

  onChangeState(name: string, value: boolean) {
    const { defaultValue } = this.state;

    defaultValue[name] = value;

    this.setState({ defaultValue });
    this.props.onChange(name, value);
  }

  removeImage(value: string) {
    this.setState({ logoPreviewUrl: "" });
    this.props.onChange("logoPreviewUrl", value);
  }

  handleImage(e: React.FormEvent<HTMLInputElement>) {
    const imageFile = e.currentTarget.files;

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        this.setState({ logoPreviewStyle: { opacity: "0.9" } });
      },

      afterUpload: ({ response }) => {
        this.setState({
          logo: response,
          logoPreviewStyle: { opacity: "1" }
        });
      },

      afterRead: ({ result }) => {
        this.setState({ logoPreviewUrl: result });
        this.props.onChange("logoPreviewUrl", result);
      }
    });
  }

  renderUploadImage() {
    const { image, skip } = this.props;

    if (!image) {
      return (
        <input
          type="file"
          onChange={(e: React.FormEvent<HTMLInputElement>) =>
            this.handleImage(e)
          }
          disabled={skip}
        />
      );
    }

    return (
      <React.Fragment>
        <img src={image} alt="previewImage" />
        <Icon
          icon="cancel-1"
          size={15}
          onClick={(e: React.MouseEvent<HTMLElement>) => this.removeImage((e.currentTarget as HTMLInputElement).value)}
        />
      </React.Fragment>
    );
  }

  footerActions() {
    return (
      <ActionBar
        right={
          <FormControl
            checked={this.props.skip || false}
            id="isSkip"
            componentClass="checkbox"
            onChange={e =>
              this.onChangeState("isSkip",( e.currentTarget as HTMLInputElement).checked)
            }
          >
            {__("Skip callOut")}
          </FormControl>
        }
      />
    );
  }

  render() {
    const { skip } = this.props;

    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem deactive={skip}>
            <FormGroup>
              <ControlLabel>Callout title</ControlLabel>
              <FormControl
                id="callout-title"
                type="text"
                value={this.props.calloutTitle}
                disabled={skip}
                onChange={e =>
                  this.onChangeFunction("calloutTitle", (e.currentTarget as HTMLInputElement).value)
                }
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Callout body</ControlLabel>
              <FormControl
                id="callout-body"
                type="text"
                value={this.props.bodyValue}
                disabled={skip}
                onChange={e =>
                  this.onChangeFunction("bodyValue", (e.currentTarget as HTMLInputElement).value)
                }
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Callout button text</ControlLabel>
              <FormControl
                id="callout-btn-text"
                value={this.props.calloutBtnText}
                disabled={skip}
                onChange={e =>
                  this.onChangeFunction("calloutBtnText", (e.currentTarget as HTMLInputElement).value)
                }
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Featured image</ControlLabel>
              <ImageContent>{this.renderUploadImage()}</ImageContent>
            </FormGroup>
          </LeftItem>
          {this.footerActions()}
        </FlexColumn>

        <Preview>{!skip && <CalloutPreview {...this.props} />}</Preview>
      </FlexItem>
    );
  }
}

export default CallOut;
