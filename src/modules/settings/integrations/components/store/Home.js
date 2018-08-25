import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import Sidebar from 'modules/settings/integrations/components/Sidebar';
import Row from './Row';
import { integrations } from './constants';
import { IntegrationWrapper } from './styles';

const propTypes = {
  totalCount: PropTypes.object
};

class Home extends Component {
  renderContent() {
    const { totalCount } = this.props;

    return (
      <IntegrationWrapper>
        {integrations.map(obj => (
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
    const { __ } = this.context;

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

Home.propTypes = propTypes;
Home.contextTypes = {
  __: PropTypes.func
};

export default Home;
