import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CalloutPreview, FormPreview, SuccessPreview } from './preview';
import {
  FlexItem,
  FullPreview,
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
  carousel: PropTypes.string,
  thankContent: PropTypes.string,
  skip: PropTypes.bool
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
    const { carousel } = this.props;

    if (carousel === 'callout') {
      return <CalloutPreview {...this.props} />;
    }

    if (carousel === 'form') {
      return <FormPreview {...this.props} />;
    }

    return <SuccessPreview {...this.props} />;
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
        <FullPreview>
          <div>
            {this.renderTabs('Desktop', 'desktop')}
            {this.renderTabs('Tablet', 'tablet')}
            {this.renderTabs('Mobile', 'mobile')}
          </div>
          {this.renderResolutionPreview()}
          <CarouselSteps>
            {!this.props.skip && this.carouseItems('CallOut', 'callout')}
            {this.carouseItems('Lead', 'form')}
            {this.carouseItems('Success', 'success')}
          </CarouselSteps>
        </FullPreview>
      </FlexItem>
    );
  }
}

FullPreviewStep.propTypes = propTypes;
FullPreviewStep.contextTypes = {
  __: PropTypes.func
};

export default FullPreviewStep;
