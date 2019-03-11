import {
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { LeftItem, Preview } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { uploadHandler } from 'modules/common/utils';
import { ActionBar } from 'modules/layout/components';
import * as React from 'react';
import { CalloutPreview } from './preview';
import { FlexColumn, FlexItem, ImageContent } from './style';

const defaultValue = {
  isSkip: false
};

type Props = {
  type: string;
  onChange: (
    name:
      | 'calloutBtnText'
      | 'bodyValue'
      | 'calloutTitle'
      | 'isSkip'
      | 'logoPreviewUrl'
      | 'logo'
      | 'logoPreviewStyle'
      | 'defaultValue',
    value: string | boolean | object | any
  ) => void;
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
  calloutBtnText?: string;
  bodyValue?: string;
  calloutTitle?: string;
  isSkip?: boolean;
};

class CallOut extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      logo: '',
      logoPreviewStyle: {},
      defaultValue
    };
  }

  onChangeFunction = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
    this.props.onChange(name, value);
  };

  onChangeState = <T extends keyof State>(name: T, value: boolean) => {
    this.setState(state => ({
      defaultValue: {
        ...state.defaultValue,
        [name]: value
      }
    }));
    this.props.onChange(name, value);
  };

  removeImage = (value: string) => {
    this.setState({ logoPreviewUrl: '' });
    this.props.onChange('logoPreviewUrl', value);
  };

  handleImage = (e: React.FormEvent<HTMLInputElement>) => {
    const imageFile = e.currentTarget.files;

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        this.setState({ logoPreviewStyle: { opacity: '0.9' } });
      },

      afterUpload: ({ response }) => {
        this.setState({
          logo: response,
          logoPreviewStyle: { opacity: '1' }
        });
      },

      afterRead: ({ result }) => {
        this.setState({ logoPreviewUrl: result });
        this.props.onChange('logoPreviewUrl', result);
      }
    });
  };

  renderUploadImage() {
    const { image, skip } = this.props;

    const onChange = (e: React.FormEvent<HTMLInputElement>) =>
      this.handleImage(e);
    const onClick = (e: React.MouseEvent<HTMLElement>) =>
      this.removeImage((e.currentTarget as HTMLInputElement).value);

    if (!image) {
      return (
        <input
          type="file"
          onChange={onChange}
          disabled={skip}
          accept="image/*"
        />
      );
    }

    return (
      <React.Fragment>
        <img src={image} alt="previewImage" />
        <Icon icon="cancel-1" size={15} onClick={onClick} />
      </React.Fragment>
    );
  }

  footerActions = () => {
    const onChange = e =>
      this.onChangeState(
        'isSkip',
        (e.currentTarget as HTMLInputElement).checked
      );

    return (
      <ActionBar
        right={
          <FormControl
            checked={this.props.skip || false}
            id="isSkip"
            componentClass="checkbox"
            onChange={onChange}
          >
            {__('Skip callOut')}
          </FormControl>
        }
      />
    );
  };

  render() {
    const { skip } = this.props;

    const onChangeTitle = (e: React.FormEvent<HTMLElement>) =>
      this.onChangeFunction(
        'calloutTitle',
        (e.currentTarget as HTMLInputElement).value
      );

    const onChangeBody = e =>
      this.onChangeFunction(
        'bodyValue',
        (e.currentTarget as HTMLInputElement).value
      );

    const onChangeBtnText = e =>
      this.onChangeFunction(
        'calloutBtnText',
        (e.currentTarget as HTMLInputElement).value
      );

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
                onChange={onChangeTitle}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Callout body</ControlLabel>
              <FormControl
                id="callout-body"
                componentClass="textarea"
                value={this.props.bodyValue}
                disabled={skip}
                onChange={onChangeBody}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Callout button text</ControlLabel>
              <FormControl
                id="callout-btn-text"
                value={this.props.calloutBtnText}
                disabled={skip}
                onChange={onChangeBtnText}
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
