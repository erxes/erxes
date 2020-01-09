import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Table from 'modules/common/components/table';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { ITag } from 'modules/tags/types';
import React from 'react';
import FormComponent from './Form';
import Row from './Row';
import Sidebar from './Sidebar';

type Props = {
  tags: ITag[];
  type: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (tag: ITag) => void;
  loading: boolean;
};

function List({ tags, type, remove, loading, renderButton }: Props) {
  const trigger = (
    <Button btnStyle="success" size="small" icon="add">
      Add tag
    </Button>
  );

  const modalContent = props => (
    <FormComponent {...props} type={type} renderButton={renderButton} />
  );

  const actionBarRight = (
    <ModalTrigger
      title="Add tag"
      autoOpenKey={`showTag${type}Modal`}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const actionBar = <Wrapper.ActionBar right={actionBarRight} />;
  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Name')}</th>
          <th>{__('Item counts')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>
        {tags.map(tag => (
          <Row
            key={tag._id}
            tag={tag}
            count={tag.objectCount}
            type={type}
            remove={remove}
            renderButton={renderButton}
          />
        ))}
      </tbody>
    </Table>
  );

  const breadcrumb = [
    { title: __('Tags'), link: '/tags/engageMessage' },
    { title: __(type) }
  ];

  return (
    <Wrapper
      header={<Wrapper.Header title={__(type)} breadcrumb={breadcrumb} />}
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={tags.length}
          emptyText="There is no tag."
          emptyImage="/images/actions/8.svg"
        />
      }
      leftSidebar={<Sidebar />}
    />
  );
}

export default List;
