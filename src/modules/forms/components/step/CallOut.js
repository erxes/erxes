import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { uploadHandler } from 'modules/common/utils';
import {
  FormControl,
  FormGroup,
  ControlLabel,
  Icon
} from 'modules/common/components';
import { dimensions, colors } from 'modules/common/styles';
import {
  EmbeddedPreview,
  PopupPreview,
  ShoutboxPreview,
  DropdownPreview,
  SlideLeftPreview,
  SlideRightPreview
} from './preview';
import { FlexItem, FlexColumn, LeftItem, Footer, Preview } from './style';

const ImageWrapper = styled.div`
  border: 1px dashed ${colors.borderDarker};
  border-radius: 5px;
  position: relative;
  background: ${colors.colorLightBlue};
`;

const ImageContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${dimensions.coreSpacing}px;
  min-height: 200px;

  img {
    max-width: 300px;
  }

  i {
    visibility: hidden;
    cursor: pointer;
    position: absolute;
    right: 150px;
    top: 30px;
    width: 30px;
    height: 30px;
    display: block;
    border-radius: 30px;
    text-align: center;
    line-height: 30px;
    background: rgba(255, 255, 255, 0.5);
    transition: all ease 0.3s;
  }

  &:hover {
    i {
      visibility: visible;
    }
  }
`;

const propTypes = {
  type: PropTypes.string,
  onChange: PropTypes.func,
  calloutTitle: PropTypes.string,
  calloutBtnText: PropTypes.string,
  bodyValue: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string
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

  renderPreview() {
    const { type } = this.props;

    if (type === 'shoutbox') {
      return <ShoutboxPreview {...this.props} />;
    }

    if (type === 'popup') {
      return <PopupPreview {...this.props} />;
    }

    if (type === 'dropdown') {
      return <DropdownPreview {...this.props} />;
    }

    if (type === 'slidein-left') {
      return <SlideLeftPreview {...this.props} />;
    }

    if (type === 'slidein-right') {
      return <SlideRightPreview {...this.props} />;
    }

    return <EmbeddedPreview {...this.props} />;
  }

  renderUploadImage() {
    const { image, skip } = this.props;

    if (!image) {
      return <input type="file" onChange={this.handleImage} disabled={skip} />;
    }

    return (
      <div>
        <img src={image} alt="previewImage" />
        <Icon
          icon="close"
          size={15}
          onClick={e => this.removeImage(e.target.value)}
        />
      </div>
    );
  }

  footerActions() {
    const { __ } = this.context;

    return (
      <Footer>
        <FormControl
          checked={this.props.skip || false}
          id="isSkip"
          componentClass="checkbox"
          onChange={e => this.onChangeState('isSkip', e.target.checked)}
        >
          {__('Skip callOut')}
        </FormControl>
      </Footer>
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
              <ImageWrapper>
                <ImageContent>{this.renderUploadImage()}</ImageContent>
              </ImageWrapper>
            </FormGroup>
          </LeftItem>
          {this.footerActions()}
        </FlexColumn>

        <Preview>{!skip && this.renderPreview()}</Preview>
      </FlexItem>
    );
  }
}

CallOut.propTypes = propTypes;
CallOut.contextTypes = {
  __: PropTypes.func
};

export default CallOut;
