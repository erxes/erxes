import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import Sidebar from 'modules/settings/integrations/components/Sidebar';
import { INTEGRATIONS } from 'modules/settings/integrations/constants';
import React, { Component } from 'react';
import Row from './Row';
import { IntegrationWrapper } from './styles';

type Props = {
  totalCount: any;
};

class Home extends Component<Props> {
  renderContent() {
    const { totalCount } = this.props;

    return (
      <IntegrationWrapper>
        {INTEGRATIONS.map(obj => (
          <Row
            key={obj.name}
            title={obj.title}
            integrations={obj.rows}
            totalCount={totalCount}
          />
        ))}
      </IntegrationWrapper>
    );
  }

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Integrations') }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
      />
    );
  }
}

export default Home;
