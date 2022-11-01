import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { IRouterProps } from '@erxes/ui/src/types';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import { withRouter } from 'react-router-dom';

type Props = {
  // step: string;
  queryParams: any;
  history: any;
} & IRouterProps;

function Builder(props: Props) {
  return (
    <>
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Webbuilder Entries')}
            breadcrumb={[{ title: __('Webbuilder') }]}
          />
        }
        actionBar={
          <Wrapper.ActionBar right={<div>Right</div>} left={<div>Left</div>} />
        }
        leftSidebar={<div>Sidebar</div>}
        content={
          <DataWithLoader
            data={<div>Content</div>}
            loading={false}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        footer={<Pagination count={0} />}
        transparent={true}
      />
    </>
  );
}

export default withRouter<Props>(Builder);
