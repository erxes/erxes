import {
  Button,
  DataWithLoader,
  ModalTrigger,
  Pagination
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { IBreadCrumbItem } from '../../../common/types';
import { ICommonListProps } from '../types';

type Props = {
  title: string;
  formTitle?: string;
  size?: string;
  renderForm: (doc: { save: () => void; closeModal: () => void }) => any;
  renderContent: (params: any) => any;
  leftActionBar: React.ReactNode;
  breadcrumb?: IBreadCrumbItem[];
  center?: boolean;
  renderFilter?: () => any;
};

class List extends React.Component<Props & ICommonListProps, {}> {
  render() {
    const {
      title,
      formTitle,
      size,
      renderContent,
      renderForm,
      renderFilter,
      leftActionBar,
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
        {formTitle}
      </Button>
    );

    const content = props => {
      return renderForm({ ...props, save });
    };

    const actionBarRight = (
      <ModalTrigger
        title={formTitle || ''}
        size={size}
        trigger={trigger}
        content={content}
      />
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        actionBar={
          <Wrapper.ActionBar left={leftActionBar} right={actionBarRight} />
        }
        footer={<Pagination count={totalCount} />}
        center={center}
        content={
          <>
            {renderFilter && renderFilter()}
            <DataWithLoader
              data={renderContent({ objects, save, refetch, remove })}
              loading={loading}
              count={totalCount}
              emptyText="Oops! No data here"
              emptyImage="/images/actions/5.svg"
            />
          </>
        }
      />
    );
  }
}

export default List;
