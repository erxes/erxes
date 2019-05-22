import { dimensions } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import { AlertItem } from 'modules/common/utils/Alert/Alert';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { Icon } from '../../common/components';

const OldBrowserWarning = styledTS<{ visible?: boolean }>(styled(AlertItem))`
  position: absolute;
  left: ${dimensions.headerSpacing - 15}%;
  max-width: 500px;
  text-align: center;
  visibility: ${props => (props.visible ? 'visible' : 'hidden')};
  transition: all 0.1s;

  > div {
    margin-top: ${dimensions.unitSpacing - 5}px;
  }

  .icon-cancel {
    float: right;
    cursor: pointer;
  }
`;

type State = {
  isVisible: boolean;
};

class DetectBrowser extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.state = { isVisible: true };
  }

  closeAlert = () => {
    this.setState({ isVisible: false });
  };

  renderWarning(name: string, oldVersionNumber: number) {
    const { userAgent } = navigator;

    const splittedVersion = userAgent.split(name)[1];
    const browserVersion = splittedVersion.split('.')[0];

    if (Number(browserVersion) < oldVersionNumber) {
      return (
        <OldBrowserWarning type="error" visible={this.state.isVisible}>
          <b>
            <Icon icon="information" />{' '}
            {__('Please upgrade your browser to use erxes!')}
            <Icon icon="cancel" size={12} onClick={this.closeAlert} />
          </b>
          <div>
            {__(
              'Unfortunately, You are running on a browser that may not be fully compatible with erxes. '
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
      return this.renderWarning('Chrome/', 90);
    }

    if (
      userAgent.indexOf('Safari') !== -1 &&
      userAgent.indexOf('Chrome') === -1
    ) {
      return this.renderWarning('Version/', 11);
    }

    if (userAgent.indexOf('Firefox') !== -1) {
      return this.renderWarning('Firefox/', 59);
    }

    if (userAgent.indexOf('Opera') !== -1 || userAgent.indexOf('OPR') !== -1) {
      return this.renderWarning('Opera/', 45);
    }

    if (userAgent.indexOf('Edge') !== -1) {
      return this.renderWarning('Edge/', 16);
    }

    return null;
  }
}

export default DetectBrowser;
