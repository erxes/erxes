import {
  Button,
  DataWithLoader,
  ModalTrigger,
  Pagination
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { DescImg, MainDescription } from 'modules/settings/styles';
import * as React from 'react';
import { IBreadCrumbItem } from '../../../common/types';
import { IActionBarLeft, ICommonListProps } from '../types';

type Props = {
  title?: string;
  size?: string;
  renderForm: (doc: { save: () => void; closeModal: () => void }) => any;
  renderContent: (params: any) => any;
  renderActionBarLeft: IActionBarLeft[];
  breadcrumb?: IBreadCrumbItem[];
  center?: boolean;
};

class List extends React.Component<Props & ICommonListProps, {}> {
  render() {
    const {
      title,
      size,
      renderContent,
      renderActionBarLeft,
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

    const actionBarRight = (
      <ModalTrigger
        title={title || ''}
        size={size}
        trigger={trigger}
        content={content}
      />
    );

    const actionBarLeft = () => {
      return renderActionBarLeft.map((item, index) => (
        <MainDescription key={index}>
          <DescImg src={item.icon} />
          <span>
            <h4>{item.title}</h4>
            {item.description}
          </span>
        </MainDescription>
      ));
    };

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb || []} />}
        actionBar={
          <Wrapper.ActionBar left={actionBarLeft()} right={actionBarRight} />
        }
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
