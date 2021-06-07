import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { IBreadCrumbItem } from '../../../common/types';
import { ICommonListProps } from '../types';

type Props = {
  title: string;
  formTitle?: string;
  size?: 'sm' | 'lg' | 'xl';
  renderForm: (doc: { save: () => void; closeModal: () => void }) => any;
  renderContent: (params: any) => any;
  leftActionBar: React.ReactNode;
  breadcrumb?: IBreadCrumbItem[];
  center?: boolean;
  renderFilter?: () => any;
  additionalButton?: React.ReactNode;
  emptyContent?: React.ReactNode;
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
      remove,
      additionalButton,
      emptyContent
    } = this.props;

    const trigger = (
      <Button btnStyle="success" icon="plus-circle" uppercase={false}>
        {formTitle}
      </Button>
    );

    const content = props => {
      return renderForm({ ...props, save });
    };

    const actionBarRight = (
      <>
        {additionalButton}
        <ModalTrigger
          title={formTitle || ''}
          size={size}
          enforceFocus={false}
          trigger={trigger}
          autoOpenKey="showListFormModal"
          content={content}
          dialogClassName="transform"
        />
      </>
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        actionBar={
          <Wrapper.ActionBar
            left={leftActionBar}
            right={actionBarRight}
            bottom={renderFilter && renderFilter()}
          />
        }
        footer={<Pagination count={totalCount} />}
        center={center}
        content={
          <DataWithLoader
            data={renderContent({ objects, save, refetch, remove })}
            loading={loading}
            count={totalCount}
            emptyText={__('Oops! No data here')}
            emptyImage="/images/actions/5.svg"
            emptyContent={emptyContent}
          />
        }
      />
    );
  }
}

export default List;
