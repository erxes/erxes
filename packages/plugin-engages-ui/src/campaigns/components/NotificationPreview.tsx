import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import {
  DesktopPreviewContent,
  MobilePreviewContent
} from '@erxes/ui-engage/src/styles';

import {
  DesktopPreview,
  FlexItem,
  FullPreview,
  MobilePreview,
  TabletPreview
} from '@erxes/ui/src/components/step/style';
import { PreviewContainer } from '@erxes/ui/src/components/step/preview/styles';

type Props = {
  message: string;
  title: string;
  isMobile: boolean;
};

function NotificationPreview(props: Props) {
  return (
    <FullPreview>
      <h3>
        <Icon icon="eye" /> {__('Preview')}
      </h3>
      {props?.isMobile ? (
        <MobilePreview>
          <PreviewContainer>
            <MobilePreviewContent
              dangerouslySetInnerHTML={{ __html: props.message }}
            />
          </PreviewContainer>
        </MobilePreview>
      ) : (
        <DesktopPreview>
          <PreviewContainer>
            <DesktopPreviewContent
              dangerouslySetInnerHTML={{ __html: props.message }}
            />
          </PreviewContainer>
        </DesktopPreview>
      )}
    </FullPreview>
  );
}

export default NotificationPreview;
