import Icon from 'modules/common/components/Icon';
import { Tabs, TabTitle } from 'modules/common/components/tabs';

import { __ } from 'modules/common/utils';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import CalloutPreview from './preview/CalloutPreview';
import FormPreview from './preview/FormPreview';
import SuccessPreview from './preview/SuccessPreview';
import {
  CarouselInner,
  CarouselSteps,
  DesktopPreview,
  FlexItem,
  FullPreview,
  MobilePreview,
  TabletPreview
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
  onChange: (name: 'carousel', value: string) => void;
  fields?: IField[];
  carousel: string;
  thankContent?: string;
  skip?: boolean;
};

type State = {
  currentTab: string;
};

class FullPreviewStep extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'desktop'
    };
  }

  carouseItems = (name: string, value: string) => {
    const onClick = () => this.onChangePreview(value);

    return (
      <CarouselInner selected={this.props.carousel === value}>
        <li>
          <span onClick={onClick} />
        </li>
        <span>{__(name)}</span>
      </CarouselInner>
    );
  };

  onChangeTab = (currentTab: string) => {
    this.setState({ currentTab });
  };

  onChangePreview = (value: string) => {
    return this.props.onChange('carousel', value);
  };

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
    const { currentTab } = this.state;

    if (currentTab === 'desktop') {
      return <DesktopPreview>{this.renderPreview()}</DesktopPreview>;
    }

    if (currentTab === 'tablet') {
      return <TabletPreview>{this.renderPreview()}</TabletPreview>;
    }

    return <MobilePreview>{this.renderPreview()}</MobilePreview>;
  }

  render() {
    const { currentTab } = this.state;

    return (
      <FlexItem>
        <FullPreview>
          <Tabs full={true}>
            <TabTitle
              className={currentTab === 'desktop' ? 'active' : ''}
              onClick={this.onChangeTab.bind(this, 'desktop')}
            >
              <Icon icon="laptop" /> {__('Desktop')}
            </TabTitle>
            <TabTitle
              className={currentTab === 'tablet' ? 'active' : ''}
              onClick={this.onChangeTab.bind(this, 'tablet')}
            >
              <Icon icon="paste" /> {__('Tablet')}
            </TabTitle>
            <TabTitle
              className={currentTab === 'mobile' ? 'active' : ''}
              onClick={this.onChangeTab.bind(this, 'mobile')}
            >
              <Icon icon="devices" /> {__('Mobile')}
            </TabTitle>
          </Tabs>
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
