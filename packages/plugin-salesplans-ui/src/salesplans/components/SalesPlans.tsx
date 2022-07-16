import React from 'react';
import { __, Wrapper } from '@erxes/ui/src';
import WithPermission from 'coreui/withPermission';
import Actionbar from '../containers/Actionbar';
import List from './List';
import TypeFilter from './filters/TypeFilter';
import StatusFilter from './filters/StatusFilter';

type Props = {
  data: any[];
  loading: boolean;
  refetch: () => void;
};

const SalesPlans = (props: Props) => {
  const { data, loading, refetch } = props;

  return (
    <WithPermission action="showSalesPlans">
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Sales Plans')}
            breadcrumb={[{ title: __('Sales Plans') }]}
          />
        }
        content={<List data={data} loading={loading} refetch={refetch} />}
        actionBar={<Actionbar refetch={refetch} />}
        leftSidebar={
          <Wrapper.Sidebar>
            <TypeFilter />
            <StatusFilter />
          </Wrapper.Sidebar>
        }
        hasBorder={true}
        transparent={true}
      />
    </WithPermission>
  );
};

export default SalesPlans;
