import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import styled from 'styled-components';
import { ChromePicker } from 'react-color';
import { uploadHandler } from 'modules/common/utils';
import { FormControl, Icon } from 'modules/common/components';
import { dimensions, colors } from 'modules/common/styles';
import { EmbeddedPreview, PopupPreview, ShoutboxPreview } from './preview';
import {
  FlexItem,
  LeftItem,
  Preview,
  Title,
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

    this.onColorChange = this.onColorChange.bind(this);
    this.onChangeBody = this.onChangeBody.bind(this);
    this.renderPreview = this.renderPreview.bind(this);
    this.onChangeBtn = this.onChangeBtn.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.onThemeChange = this.onThemeChange.bind(this);
    this.handleImage = this.handleImage.bind(this);
    this.removeImage = this.removeImage.bind(this);
  }

  onColorChange(e) {
    this.setState({ color: e.hex, theme: '#000' }, () => {
      this.props.onChange('color', e.hex);
      this.props.onChange('theme', '');
    });
  }

  onChangeText(value) {
    this.setState({ calloutTitle: value });
    this.props.onChange('calloutTitle', value);
  }

  onChangeBody(value) {
    this.setState({ bodyValue: value });
    this.props.onChange('bodyValue', value);
  }

  onThemeChange(value) {
    this.setState({ theme: value });
    this.props.onChange('theme', value);
  }

  onChangeBtn(value) {
    this.setState({ btnText: value });
    this.props.onChange('btnText', value);
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
    const {
      type,
      calloutTitle,
      bodyValue,
      btnText,
      color,
      theme,
      image
    } = this.props;

    if (type === 'shoutbox') {
      return (
        <ShoutboxPreview
          calloutTitle={calloutTitle}
          bodyValue={bodyValue}
          btnText={btnText}
          color={color}
          theme={theme}
          image={image}
        />
      );
    }

    if (type === 'popup') {
      return (
        <PopupPreview
          calloutTitle={calloutTitle}
          bodyValue={bodyValue}
          btnText={btnText}
          color={color}
          theme={theme}
          image={image}
        />
      );
    }

    return (
      <EmbeddedPreview
        calloutTitle={calloutTitle}
        bodyValue={bodyValue}
        btnText={btnText}
        color={color}
        theme={theme}
        image={image}
      />
    );
  }

  renderThemeColor(value) {
    return (
      <BackgroundSelector
        selected={this.props.theme === value}
        onClick={() => this.onThemeChange(value)}
      >
        <div style={{ backgroundColor: value }} />
      </BackgroundSelector>
    );
  }

  renderUploadImage() {
    const { image } = this.props;

    return image ? (
      <div>
        <img src={image} alt="previewImage" />
        <Icon
          icon="close"
          size={15}
          onClick={e => this.removeImage(e.target.value)}
        />
      </div>
    ) : (
      <input type="file" onChange={this.handleImage} />
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
          <Title>{__('Callout title')}</Title>
          <FormControl
            id="callout-title"
            type="text"
            value={this.props.calloutTitle}
            onChange={e => this.onChangeText(e.target.value)}
          />

          <Title>{__('Callout body')}</Title>
          <FormControl
            id="callout-body"
            type="text"
            value={this.props.bodyValue}
            onChange={e => this.onChangeBody(e.target.value)}
          />

          <Title>{__('Callout button text')}</Title>
          <FormControl
            id="callout-btn-text"
            value={this.props.btnText}
            onChange={e => this.onChangeBtn(e.target.value)}
          />

          <Title>{__('Theme color')}</Title>
          <p>{__('Try some of these colors:')}</p>

          <ColorPick>
            {this.renderThemeColor('#04A9F5')}
            {this.renderThemeColor('#392a6f')}
            {this.renderThemeColor('#fd3259')}
            {this.renderThemeColor('#67C682')}
            {this.renderThemeColor('#F5C22B')}
            {this.renderThemeColor('#888')}
            <OverlayTrigger
              trigger="click"
              rootClose
              placement="bottom"
              overlay={popoverTop}
            >
              <ColorPicker>
                <Picker style={{ backgroundColor: this.props.color }} />
              </ColorPicker>
            </OverlayTrigger>
          </ColorPick>

          <Title>{__('Featured image')}</Title>
          <ImageWrapper>
            <ImageContent>{this.renderUploadImage()}</ImageContent>
          </ImageWrapper>
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
