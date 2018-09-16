import {
  Button,
  DataWithLoader,
  ModalTrigger,
  Pagination
} from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import Sidebar from 'modules/settings/Sidebar';
import * as React from 'react';
import { ICommonListProps } from '../types';

type Props = {
  title?: string;
  size?: string;
  renderForm?: (doc: { save: () => void }) => any;
  renderContent?: (params: any) => any;
  breadcrumb?: any[];
};

class List extends React.Component<Props & ICommonListProps, {}> {
  render() {
    const {
      title,
      size,
      renderContent,
      renderForm,
      breadcrumb,
      totalCount,
      objects,
      loading,
      save,
      refetch,
      remove
    } = this.props;

    const trigger = (
      <Button btnStyle="success" size="small" icon="add">
        {title}
      </Button>
    );

    const actionBarLeft = (
      <ModalTrigger title={title} size={size} trigger={trigger}>
        {renderForm({ save })}
      </ModalTrigger>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        actionBar={<Wrapper.ActionBar right={actionBarLeft} />}
        footer={<Pagination count={totalCount} />}
        transparent={false}
        content={
          <DataWithLoader
            data={renderContent({ objects, save, refetch, remove })}
            loading={loading}
            count={totalCount}
            emptyText="There is no data."
            emptyImage="/images/robots/robot-05.svg"
          />
        }
      />
    );
  }
}

export default List;
