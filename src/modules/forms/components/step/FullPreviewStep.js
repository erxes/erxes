import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  EmbeddedPreview,
  PopupPreview,
  ShoutboxPreview,
  DropdownPreview,
  SlideLeftPreview,
  SlideRightPreview
} from './preview';
import {
  FlexItem,
  Preview,
  ResolutionTabs,
  DesktopPreview,
  TabletPreview,
  MobilePreview,
  Tabs,
  CarouselSteps,
  CarouselInner
} from './style';

const propTypes = {
  type: PropTypes.string,
  calloutTitle: PropTypes.string,
  formTitle: PropTypes.string,
  formBtnText: PropTypes.string,
  calloutBtnText: PropTypes.string,
  bodyValue: PropTypes.string,
  formDesc: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string,
  preview: PropTypes.string,
  onChange: PropTypes.func,
  fields: PropTypes.array,
  integration: PropTypes.object,
  carousel: PropTypes.string,
  thankContent: PropTypes.string
};

class FullPreviewStep extends Component {
  renderTabs(name, value) {
    const { __ } = this.context;

    return (
      <Tabs
        selected={this.props.preview === value}
        onClick={() => this.onChange(value)}
      >
        {__(name)}
      </Tabs>
    );
  }

  carouseItems(name, value) {
    const { __ } = this.context;

    return (
      <CarouselInner selected={this.props.carousel === value}>
        <li>
          <span onClick={() => this.onChangePreview(value)} />
        </li>
        <span>{__(name)}</span>
      </CarouselInner>
    );
  }

  onChange(value) {
    this.props.onChange('preview', value || 'mobile');
  }

  onChangePreview(value) {
    return this.props.onChange('carousel', value);
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

    if (type === 'slideInLeft') {
      return <SlideLeftPreview {...this.props} />;
    }

    if (type === 'slideInRight') {
      return <SlideRightPreview {...this.props} />;
    }

    return <EmbeddedPreview {...this.props} />;
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
    }

    if (preview === 'tablet') {
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
          <CarouselSteps>
            <ol>
              {!this.props.skip && this.carouseItems('CallOut', 'callout')}
              {this.carouseItems('Form', 'form')}
              {this.carouseItems('Success', 'success')}
            </ol>
          </CarouselSteps>
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
