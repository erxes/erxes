import { HeaderDescription } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { INTEGRATIONS } from 'modules/settings/integrations/constants';
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

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={
          <Wrapper.ActionBar
            left={
              <HeaderDescription
                icon="/images/actions/33.svg"
                title="App store"
                description="Set up your integrations and start connecting with your customers. Now you can reach them on wherever platform they feel most comfortable."
              />
            }
          />
        }
        content={this.renderContent()}
      />
    );
  }
}

export default Home;
