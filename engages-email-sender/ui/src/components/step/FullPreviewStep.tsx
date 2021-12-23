import Icon from 'erxes-ui/lib/components/Icon';
import { Tabs, TabTitle } from 'erxes-ui/lib/components/tabs';

import { __ } from 'erxes-ui/lib/utils';
import {
  DesktopPreviewContent,
  MobilePreviewContent
} from '../../styles';
import React from 'react';

type Props = {
  content: string;
  templateId?: string;
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

  onChangeTab = (currentTab: string) => {
    this.setState({ currentTab });
  };

  renderResolutionPreview() {
    const { currentTab } = this.state;
    const { content, templateId } = this.props;

    if (currentTab === 'desktop') {
      return (
            <DesktopPreviewContent
              templateId={templateId}
              dangerouslySetInnerHTML={{ __html: content }}
            />
      );
    }

    if (currentTab === 'tablet') {
      return (
            <MobilePreviewContent
              templateId={templateId}
              dangerouslySetInnerHTML={{ __html: content }}
            />
      );
    }

    return (
          <MobilePreviewContent dangerouslySetInnerHTML={{ __html: content }} />
    );
  }

  render() {
    const { currentTab } = this.state;

    return (
          <Tabs full={true}>
            <TabTitle
              className={currentTab === 'desktop' ? 'active' : ''}
              onClick={this.onChangeTab.bind(this, 'desktop')}
            >
              <Icon icon="monitor-1" /> {__('Desktop')}
            </TabTitle>
            <TabTitle
              className={currentTab === 'tablet' ? 'active' : ''}
              onClick={this.onChangeTab.bind(this, 'tablet')}
            >
              <Icon icon="tablet" /> {__('Tablet')}
            </TabTitle>
            <TabTitle
              className={currentTab === 'mobile' ? 'active' : ''}
              onClick={this.onChangeTab.bind(this, 'mobile')}
            >
              <Icon icon="mobile-android" /> {__('Mobile')}
            </TabTitle>
          </Tabs>
    );
  }
}

export default FullPreviewStep;
