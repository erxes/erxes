import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Info from 'modules/common/components/Info';
import { LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { uploadHandler } from 'modules/common/utils';
import ActionBar from 'modules/layout/components/ActionBar';
import React from 'react';
import { FlexColumn, FlexItem, ImagePreview, ImageUpload } from './style';

const defaultValue = {
  isSkip: false
};

type Props = {
  type: string;
  onChange: (
    name:
      | 'carousel'
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
    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
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

    if (name === 'isSkip') {
      this.props.onChange('carousel', value ? 'form' : 'callout');
    }
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

  renderImagePreview() {
    const { image } = this.props;

    if (!image) {
      return (
        <>
          <Icon icon="plus" />
          {__('Upload')}
        </>
      );
    }

    return <ImagePreview src={image} alt="previewImage" />;
  }

  renderUploadImage() {
    const { image, skip } = this.props;

    const onChange = (e: React.FormEvent<HTMLInputElement>) =>
      this.handleImage(e);
    const onClick = (e: React.MouseEvent<HTMLElement>) =>
      this.removeImage((e.currentTarget as HTMLInputElement).value);

    return (
      <ImageUpload>
        <label htmlFor="file-upload">
          <input
            id="file-upload"
            type="file"
            onChange={onChange}
            disabled={skip}
            accept="image/x-png,image/jpeg"
          />
          {this.renderImagePreview()}
        </label>

        {image && (
          <Button
            btnStyle="link"
            icon="cancel"
            size="small"
            onClick={onClick}
          />
        )}
      </ImageUpload>
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
    const { skip, calloutTitle, bodyValue, calloutBtnText } = this.props;

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
            <Info>
              {__(
                'Call Out is a brief message you wish to display before showing the full form.'
              )}
            </Info>
            <FormGroup>
              <ControlLabel>Callout title</ControlLabel>
              <FormControl
                id="callout-title"
                type="text"
                value={calloutTitle}
                disabled={skip}
                onChange={onChangeTitle}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Callout body</ControlLabel>
              <FormControl
                id="callout-body"
                componentClass="textarea"
                value={bodyValue}
                disabled={skip}
                onChange={onChangeBody}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Callout button text</ControlLabel>
              <FormControl
                id="callout-btn-text"
                value={calloutBtnText}
                disabled={skip}
                onChange={onChangeBtnText}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Featured image</ControlLabel>
              <p>{__('You can upload only image file')}</p>
              {this.renderUploadImage()}
            </FormGroup>
          </LeftItem>
          {this.footerActions()}
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default CallOut;
