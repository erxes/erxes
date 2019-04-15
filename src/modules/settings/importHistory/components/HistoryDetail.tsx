import * as React from 'react';
import styled from 'styled-components';
import { HeaderDescription } from '../../../common/components';
import { colors, dimensions } from '../../../common/styles';
import { __ } from '../../../common/utils';
import { Wrapper } from '../../../layout/components';
import CircularProgressBar from './CircularProgressBar';

const Box = styled.div`
  padding: ${dimensions.coreSpacing}px;
  padding-bottom: 0;
  background: ${colors.colorWhite};
  margin-bottom: ${dimensions.unitSpacing}px;
`;

class HistoryDetail extends React.Component {
  renderContent = () => {
    return (
      <Box style={{ width: '100%' }}>
        <div style={{ margin: '0 auto', display: 'table' }}>
          <CircularProgressBar percentage={20} strokeWidth={50} sqSize={600} />
        </div>
      </Box>
    );
  };

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Import History ') }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={
          <Wrapper.ActionBar
            left={
              <HeaderDescription
                icon="/images/actions/28.svg"
                title="Import history status"
                description={`You can track your recently imported customers or companies here`}
              />
            }
          />
        }
        content={this.renderContent()}
        transparent={true}
        center={true}
      />
    );
  }
}

export default HistoryDetail;
