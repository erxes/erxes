import { FlexItem, FullPreview } from './style';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import { Tabs, TabTitle } from 'modules/common/components/tabs';
import React from 'react';

function FullPreviewStep() {
  return (
    <FlexItem>
      <FullPreview>
        <Tabs full={true}>
          <TabTitle
            className={''}
            // onClick={this.onChangeTab.bind(this, 'desktop')}
          >
            <Icon icon="monitor-1" /> {__('Desktop')}
          </TabTitle>
          <TabTitle
            className={''}
            // onClick={this.onChangeTab.bind(this, 'tablet')}
          >
            <Icon icon="tablet" /> {__('Tablet')}
          </TabTitle>
          <TabTitle
            className={''}
            // onClick={this.onChangeTab.bind(this, 'mobile')}
          >
            <Icon icon="mobile-android" /> {__('Mobile')}
          </TabTitle>
        </Tabs>
      </FullPreview>
    </FlexItem>
  );
}

export default FullPreviewStep;
