import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { uploadHandler } from 'modules/common/utils';
import { ActionBar } from 'modules/layout/components';
import {
  FormControl,
  FormGroup,
  ControlLabel,
  Icon
} from 'modules/common/components';
import { CalloutPreview } from './preview';
import { FlexItem, FlexColumn, LeftItem, Preview, ImageContent } from './style';

const propTypes = {
  type: PropTypes.string,
  onChange: PropTypes.func,
  calloutTitle: PropTypes.string,
  calloutBtnText: PropTypes.string,
  bodyValue: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string,
  skip: PropTypes.bool
};

const defaultValue = {
  isSkip: false
};

class CallOut extends Component {
  constructor(props) {
    super(props);

    this.state = {
      logo: '',
      logoPreviewStyle: {},
      defaultValue: defaultValue
    };

    this.onChangeFunction = this.onChangeFunction.bind(this);
    this.onChangeState = this.onChangeState.bind(this);
    this.footerActions = this.footerActions.bind(this);
    this.handleImage = this.handleImage.bind(this);
    this.removeImage = this.removeImage.bind(this);
  }

  onChangeFunction(name, value) {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
  }

  onChangeState(name, value) {
    const { defaultValue } = this.state;

    defaultValue[name] = value;

    this.setState({ defaultValue });
    this.props.onChange(name, value);
  }

  removeImage(value) {
    this.setState({ logoPreviewUrl: '' });
    this.props.onChange('logoPreviewUrl', value);
  }

  handleImage(e) {
    const imageFile = e.target.files[0];

    uploadHandler({
      file: imageFile,

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
  }

  renderUploadImage() {
    const { image, skip } = this.props;

    if (!image) {
      return <input type="file" onChange={this.handleImage} disabled={skip} />;
    }

    return (
      <Fragment>
        <img src={image} alt="previewImage" />
        <Icon
          icon="cancel-1"
          size={15}
          onClick={e => this.removeImage(e.target.value)}
        />
      </Fragment>
    );
  }

  footerActions() {
    const { __ } = this.context;

    return (
      <ActionBar
        right={
          <FormControl
            checked={this.props.skip || false}
            id="isSkip"
            componentClass="checkbox"
            onChange={e => this.onChangeState('isSkip', e.target.checked)}
          >
            {__('Skip callOut')}
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
                  this.onChangeFunction('calloutTitle', e.target.value)
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
                  this.onChangeFunction('bodyValue', e.target.value)
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
                  this.onChangeFunction('calloutBtnText', e.target.value)
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

CallOut.propTypes = propTypes;
CallOut.contextTypes = {
  __: PropTypes.func
};

export default CallOut;
