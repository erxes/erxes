import { dimensions } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import { AlertItem } from 'modules/common/utils/Alert/Alert';
import * as React from 'react';
import styled from 'styled-components';

const OldBrowserWarning = styled(AlertItem)`
  position: absolute;
  left: ${dimensions.headerSpacing - 5}%;
`;

class DetectBrowser extends React.Component {
  renderWarning(name: string, oldVersionNumber: string) {
    const { userAgent } = navigator;

    const splittedVersion = userAgent.split(name)[1];
    const browserVersion = splittedVersion.split('.')[0];

    if (browserVersion < oldVersionNumber) {
      return (
        <OldBrowserWarning type="error">
          <b>{__('Please upgrade your browser to use erxes.')}</b>
          <div>
            {__(
              'Unfortunately, You are running on a browser that may not be fully compatible with erxes.'
            )}
            {__(`Please use ${name} version ${oldVersionNumber}+.`)}
          </div>
        </OldBrowserWarning>
      );
    }

    return null;
  }

  render() {
    const { userAgent } = navigator;

    if (userAgent.indexOf('Chrome') !== -1) {
      this.renderWarning('Chrome', '58');
    }

    if (
      userAgent.indexOf('Safari') !== -1 &&
      userAgent.indexOf('Chrome') === -1
    ) {
      this.renderWarning('Version', '11');
    }

    if (userAgent.indexOf('Firefox') !== -1) {
      this.renderWarning('Firefox', '59');
    }

    if (userAgent.indexOf('Opera') !== -1 || userAgent.indexOf('OPR') !== -1) {
      this.renderWarning('Opera', '45');
    }

    if (userAgent.indexOf('Edge') !== -1) {
      this.renderWarning('Edge', '16');
    }

    return null;
  }
}

export default DetectBrowser;
