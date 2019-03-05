import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import Sidebar from 'modules/settings/integrations/components/Sidebar';
import { INTEGRATIONS } from 'modules/settings/integrations/constants';
import { DescImg, MainDescription } from 'modules/settings/styles';
import * as React from 'react';
import Row from './Row';
import { IntegrationWrapper } from './styles';

type Props = {
  totalCount: {
    messenger: number;
    form: number;
    twitter: number;
    facebook: number;
    gmail: number;
  };
  messengerAppsCount: number;
  queryParams: any;
};

class Home extends React.Component<Props> {
  renderContent() {
    const { totalCount, queryParams } = this.props;

    return (
      <IntegrationWrapper>
        {INTEGRATIONS.map(obj => (
          <Row
            key={obj.name}
            title={obj.title}
            integrations={obj.rows}
            totalCount={totalCount}
            queryParams={queryParams}
          />
        ))}
      </IntegrationWrapper>
    );
  }

  render() {
    const breadcrumb = [{ title: __('App store') }];

    const actionBarLeft = (
      <MainDescription>
        <DescImg src="/images/actions/33.svg" />
        <span>
          <h4>{__('App store')}</h4>
          {__(
            'Set up your integrations and start connecting with your customers. Now you can reach them on wherever platform they feel most comfortable.'
          )}
        </span>
      </MainDescription>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={<Wrapper.ActionBar left={actionBarLeft} />}
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
      />
    );
  }
}

export default Home;
