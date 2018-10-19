import { __ } from 'modules/common/utils';
import { IField } from 'modules/settings/properties/types';
import * as React from 'react';
import { CalloutPreview, FormPreview, SuccessPreview } from './preview';
import {
  CarouselInner,
  CarouselSteps,
  DesktopPreview,
  FlexItem,
  FullPreview,
  MobilePreview,
  TabletPreview,
  Tabs
} from './style';

type Props = {
  type: string;
  calloutTitle?: string;
  formTitle?: string;
  formBtnText?: string;
  calloutBtnText?: string;
  bodyValue?: string;
  formDesc?: string;
  color: string;
  theme: string;
  image?: string;
  preview: string;
  onChange: (name: 'preview' | 'carousel', value: string) => void;
  fields?: IField[];
  carousel: string;
  thankContent?: string;
  skip?: boolean;
};

class FullPreviewStep extends React.Component<Props, {}> {
  renderTabs(name: string, value: string) {
    const onClick = () => this.onChange(value);

    return (
      <Tabs selected={this.props.preview === value} onClick={onClick}>
        {__(name)}
      </Tabs>
    );
  }

  carouseItems(name: string, value: string) {
    const onClick = () => this.onChangePreview(value);

    return (
      <CarouselInner selected={this.props.carousel === value}>
        <li>
          <span onClick={onClick} />
        </li>
        <span>{__(name)}</span>
      </CarouselInner>
    );
  }

  onChange(value: string) {
    this.props.onChange('preview', value || 'mobile');
  }

  onChangePreview(value: string) {
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
            {this.carouseItems('Form', 'form')}
            {this.carouseItems('Success', 'success')}
          </CarouselSteps>
        </FullPreview>
      </FlexItem>
    );
  }
}

export default FullPreviewStep;
