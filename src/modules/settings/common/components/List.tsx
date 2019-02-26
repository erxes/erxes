import {
  Button,
  DataWithLoader,
  ModalTrigger,
  Pagination
} from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { IBreadCrumbItem } from '../../../common/types';
import { ICommonListProps } from '../types';

type Props = {
  title?: string;
  size?: string;
  renderForm: (doc: { save: () => void; closeModal: () => void }) => any;
  renderContent: (params: any) => any;
  breadcrumb?: IBreadCrumbItem[];
  center?: boolean;
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
      center,
      remove
    } = this.props;

    const trigger = (
      <Button btnStyle="success" size="small" icon="add">
        {title}
      </Button>
    );

    const content = props => {
      return renderForm({ ...props, save });
    };

    const actionBarLeft = (
      <ModalTrigger
        title={title || ''}
        size={size}
        trigger={trigger}
        content={content}
      />
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb || []} />}
        actionBar={<Wrapper.ActionBar right={actionBarLeft} />}
        footer={<Pagination count={totalCount} />}
        transparent={true}
        center={center}
        content={
          <DataWithLoader
            data={renderContent({ objects, save, refetch, remove })}
            loading={loading}
            count={totalCount}
            emptyText="Oops! No data here"
            emptyImage="/images/actions/5.svg"
          />
        }
      />
    );
  }
}

export default List;
