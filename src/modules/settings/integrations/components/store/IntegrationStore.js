import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import Sidebar from '../../Sidebar';
import { IntegrationStoreRow } from '.';
import { IntegrationWrapper } from './styles';
import { integrations } from './constants';

const propTypes = {
  totalCount: PropTypes.object
};

class IntegrationStore extends Component {
  renderContent() {
    const { totalCount } = this.props;

    return (
      <IntegrationWrapper>
        {integrations.map(obj => (
          <IntegrationStoreRow
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

IntegrationStore.propTypes = propTypes;
IntegrationStore.contextTypes = {
  __: PropTypes.func
};

export default IntegrationStore;
