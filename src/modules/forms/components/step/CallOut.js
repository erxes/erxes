import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import styled from 'styled-components';
import { ChromePicker } from 'react-color';
import { uploadHandler } from 'modules/common/utils';
import {
  FormControl,
  FormGroup,
  ControlLabel,
  Icon
} from 'modules/common/components';
import { dimensions, colors } from 'modules/common/styles';
import { EmbeddedPreview, PopupPreview, ShoutboxPreview } from './preview';
import {
  FlexItem,
  LeftItem,
  Preview,
  ColorPick,
  ColorPicker,
  Picker,
  BackgroundSelector
} from './style';

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
  btnText: PropTypes.string,
  bodyValue: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string
};

class CallOut extends Component {
  constructor(props) {
    super(props);

    this.state = {
      logo: '',
      logoPreviewStyle: {}
    };

    this.onChangeFunction = this.onChangeFunction.bind(this);
    this.onColorChange = this.onColorChange.bind(this);
    this.handleImage = this.handleImage.bind(this);
    this.removeImage = this.removeImage.bind(this);
  }

  onChangeFunction(name, value) {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
  }

  onColorChange(e) {
    this.setState({ color: e.hex, theme: '#000' }, () => {
      this.props.onChange('color', e.hex);
      this.props.onChange('theme', '');
    });
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

    return <EmbeddedPreview {...this.props} />;
  }

  renderThemeColor(value) {
    return (
      <BackgroundSelector
        selected={this.props.theme === value}
        onClick={() => this.onChangeFunction('theme', value)}
      >
        <div style={{ backgroundColor: value }} />
      </BackgroundSelector>
    );
  }

  renderUploadImage() {
    const { image } = this.props;

    if (!image) {
      return <input type="file" onChange={this.handleImage} />;
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

  render() {
    const { __ } = this.context;

    const popoverTop = (
      <Popover id="color-picker">
        <ChromePicker color={this.props.color} onChange={this.onColorChange} />
      </Popover>
    );

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>Callout title</ControlLabel>
            <FormControl
              id="callout-title"
              type="text"
              value={this.props.calloutTitle}
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
              onChange={e => this.onChangeFunction('bodyValue', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Callout button text</ControlLabel>
            <FormControl
              id="callout-btn-text"
              value={this.props.btnText}
              onChange={e => this.onChangeFunction('btnText', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Theme color</ControlLabel>
            <p>{__('Try some of these colors:')}</p>
          </FormGroup>

          <ColorPick>
            {this.renderThemeColor('#04A9F5')}
            {this.renderThemeColor('#392a6f')}
            {this.renderThemeColor('#fd3259')}
            {this.renderThemeColor('#67C682')}
            {this.renderThemeColor('#F5C22B')}
            {this.renderThemeColor('#000')}
            <OverlayTrigger
              trigger="click"
              rootClose
              placement="bottom"
              overlay={popoverTop}
            >
              <ColorPicker>
                <Picker style={{ backgroundColor: this.props.theme }} />
              </ColorPicker>
            </OverlayTrigger>
          </ColorPick>

          <FormGroup>
            <ControlLabel>Featured image</ControlLabel>
            <ImageWrapper>
              <ImageContent>{this.renderUploadImage()}</ImageContent>
            </ImageWrapper>
          </FormGroup>
        </LeftItem>

        <Preview>{this.renderPreview()}</Preview>
      </FlexItem>
    );
  }
}

CallOut.propTypes = propTypes;
CallOut.contextTypes = {
  __: PropTypes.func
};

export default CallOut;
