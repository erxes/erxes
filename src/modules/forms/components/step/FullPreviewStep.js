import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EmbeddedPreview, PopupPreview, ShoutboxPreview } from './preview';
import {
  FlexItem,
  Preview,
  ResolutionTabs,
  DesktopPreview,
  TabletPreview,
  MobilePreview
} from './style';

const propTypes = {
  kind: PropTypes.string,
  title: PropTypes.string,
  btnText: PropTypes.string,
  bodyValue: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string,
  preview: PropTypes.string,
  changeState: PropTypes.func,
  fields: PropTypes.array,
  integration: PropTypes.object
};

class FullPreviewStep extends Component {
  renderTabs(name, value) {
    const { __ } = this.context;
    return (
      <div
        selected={this.props.preview === value}
        onClick={() => this.changeState(value)}
      >
        {__(name)}
      </div>
    );
  }

  changeState(value) {
    if (value === 'desktop') {
      this.props.changeState('preview', 'desktop');
    } else if (value === 'tablet') {
      this.props.changeState('preview', 'tablet');
    } else {
      this.props.changeState('preview', 'mobile');
    }
  }

  renderPreview() {
    const {
      title,
      bodyValue,
      btnText,
      color,
      theme,
      image,
      kind,
      fields,
      preview
    } = this.props;

    if (kind === 'shoutbox') {
      return (
        <ShoutboxPreview
          title={title}
          bodyValue={bodyValue}
          btnText={btnText}
          color={color}
          theme={theme}
          image={image}
          fields={fields}
          preview={preview}
        />
      );
    } else if (kind === 'popup') {
      return (
        <PopupPreview
          title={title}
          bodyValue={bodyValue}
          btnText={btnText}
          color={color}
          theme={theme}
          image={image}
          fields={fields}
          preview={preview}
        />
      );
    }
    return (
      <EmbeddedPreview
        title={title}
        bodyValue={bodyValue}
        btnText={btnText}
        color={color}
        theme={theme}
        image={image}
        fields={fields}
        preview={preview}
      />
    );
  }

  renderResolution() {
    return (
      <ResolutionTabs>
        {this.renderTabs('Desktop', 'desktop')}
        {this.renderTabs('Tablet', 'tablet')}
        {this.renderTabs('Mobile', 'mobile')}
      </ResolutionTabs>
    );
  }

  renderResolutionPreview() {
    const { preview } = this.props;

    if (preview === 'desktop') {
      return <DesktopPreview>{this.renderPreview()}</DesktopPreview>;
    } else if (preview === 'tablet') {
      return <TabletPreview>{this.renderPreview()}</TabletPreview>;
    }
    return <MobilePreview>{this.renderPreview()}</MobilePreview>;
  }

  render() {
    return (
      <FlexItem>
        <Preview>
          {this.renderResolution()}
          {this.renderResolutionPreview()}
        </Preview>
      </FlexItem>
    );
  }
}

FullPreviewStep.propTypes = propTypes;
FullPreviewStep.contextTypes = {
  __: PropTypes.func
};

export default FullPreviewStep;
