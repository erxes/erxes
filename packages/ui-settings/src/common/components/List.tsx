// import ActionBarDropDown from '../../templates/containers/actionBar/ActionBar';
import { BarItems } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { Flex } from '@erxes/ui/src/styles/main';
import { IBreadCrumbItem } from '@erxes/ui/src/types';
import { ICommonListProps } from '../types';
import { MarginRight } from '../../styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  title: string;
  formTitle?: string;
  size?: 'sm' | 'lg' | 'xl';
  renderForm: (doc: { save: () => void; closeModal: () => void }) => any;
  renderContent: (params: any) => any;
  leftActionBar?: React.ReactNode;
  mainHead?: React.ReactNode;
  breadcrumb?: IBreadCrumbItem[];
  center?: boolean;
  renderFilter?: () => any;
  additionalButton?: React.ReactNode;
  emptyContent?: React.ReactNode;
  leftSidebar?: any;
  queryParams?: any;
  searchValue?: string;
  history?: any;
  rightActionBar?: any;
  hasBorder?: boolean;
  transparent?: boolean;
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
      mainHead,
      breadcrumb,
      totalCount,
      objects,
      loading,
      save,
      refetch,
      center,
      remove,
      additionalButton,
      emptyContent,
      leftSidebar,
      rightActionBar,
      queryParams,
      hasBorder,
      transparent,
      history
    } = this.props;

    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        {formTitle}
      </Button>
    );

    const content = props => {
      return renderForm({ ...props, save });
    };

    const actionBarRight = rightActionBar ? (
      <BarItems>
        {additionalButton}
        {/* <ActionBarDropDown queryParams={queryParams} history={history} /> */}
      </BarItems>
    ) : (
      <Flex>
        {additionalButton}&nbsp;&nbsp;
        <ModalTrigger
          title={formTitle || ''}
          size={size}
          enforceFocus={false}
          trigger={trigger}
          autoOpenKey="showListFormModal"
          content={content}
          dialogClassName="transform"
        />
      </Flex>
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
        mainHead={mainHead}
        footer={<Pagination count={totalCount} />}
        center={center}
        leftSidebar={leftSidebar}
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
        hasBorder={hasBorder}
        transparent={transparent}
      />
    );
  }
}

export default List;
