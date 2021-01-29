import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Table from 'modules/common/components/table';
import { Title } from 'modules/common/styles/main';
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
    <Button
      id={'AddTagButton'}
      btnStyle="primary"
      uppercase={false}
      icon="plus-circle"
    >
      Add tag
    </Button>
  );

  const modalContent = props => (
    <FormComponent
      {...props}
      type={type}
      renderButton={renderButton}
      tags={tags}
    />
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

  const title = (
    <Title capitalize={true}>
      {type} {__('tags')}
    </Title>
  );
  const actionBar = <Wrapper.ActionBar left={title} right={actionBarRight} />;

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Name')}</th>
          <th>{__('Item counts')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody id={'TagsShowing'}>
        {tags.map(tag => {
          const order = tag.order || '';
          const foundedString = order.match(/[/]/gi);

          return (
            <Row
              key={tag._id}
              tag={tag}
              count={tag.objectCount}
              type={type}
              space={foundedString ? foundedString.length : 0}
              remove={remove}
              renderButton={renderButton}
              tags={tags}
            />
          );
        })}
      </tbody>
    </Table>
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
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
