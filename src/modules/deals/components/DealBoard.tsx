import { __ } from 'modules/common/utils';
import { menuDeal } from 'modules/common/utils/menus';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { Board, MainActionBar } from '../containers';

type Props = {
  queryParams: any;
};

class DealBoard extends React.Component<Props> {
  renderContent() {
    const { queryParams } = this.props;

    return <Board queryParams={queryParams} />;
  }

  renderActionBar() {
    return <MainActionBar />;
  }

  render() {
    const breadcrumb = [{ title: __('Deal') }];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} submenu={menuDeal} />}
        actionBar={this.renderActionBar()}
        content={this.renderContent()}
        transparent={true}
      />
    );
  }
}

export default DealBoard;
