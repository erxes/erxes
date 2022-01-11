import Icon from 'modules/common/components/Icon';
import { Tabs, TabTitle } from 'modules/common/components/tabs';

import { __ } from 'modules/common/utils';
import {
  DesktopPreviewContent,
  MobilePreviewContent
} from 'modules/engage/styles';
import { PreviewContainer } from 'modules/leads/components/step/preview/styles';
import {
  DesktopPreview,
  FlexItem,
  FullPreview,
  MobilePreview,
  TabletPreview
} from 'modules/leads/components/step/style';
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
        <DesktopPreview>
          <PreviewContainer>
            <DesktopPreviewContent
              templateId={templateId}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </PreviewContainer>
        </DesktopPreview>
      );
    }

    if (currentTab === 'tablet') {
      return (
        <TabletPreview>
          <PreviewContainer>
            <MobilePreviewContent
              templateId={templateId}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </PreviewContainer>
        </TabletPreview>
      );
    }

    return (
      <MobilePreview>
        <PreviewContainer>
          <MobilePreviewContent dangerouslySetInnerHTML={{ __html: content }} />
        </PreviewContainer>
      </MobilePreview>
    );
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
          {this.renderResolutionPreview()}
        </FullPreview>
      </FlexItem>
    );
  }
}

export default FullPreviewStep;
