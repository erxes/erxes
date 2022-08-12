import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormComponent from '@erxes/ui-tags/src/components/Form';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ITag } from '@erxes/ui-tags/src/types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Row from './Row';
import Sidebar from './Sidebar';
import Table from '@erxes/ui/src/components/table';
import { Title } from '@erxes/ui-settings/src/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';

type Props = {
  types: any[];
  tags: ITag[];
  type: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (tag: ITag) => void;
  merge: (sourceId: string, destId: string, callback) => void;
  loading: boolean;
};

function List({
  tags,
  type,
  remove,
  merge,
  loading,
  renderButton,
  types
}: Props) {
  const contentType = (type || '').split(':')[1];

  const trigger = (
    <Button id={'AddTagButton'} btnStyle="success" icon="plus-circle">
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
      title={__('Add tag')}
      autoOpenKey={`showTag${type}Modal`}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const title = (
    <Title capitalize={true}>
      {contentType} {__('tags')}
    </Title>
  );
  const actionBar = <Wrapper.ActionBar left={title} right={actionBarRight} />;

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Name')}</th>
          <th>{__('Total item counts')}</th>
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
              merge={merge}
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
    { title: __('Tags'), link: '/tags' },
    { title: __(contentType) }
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__(contentType)} breadcrumb={breadcrumb} />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={tags.length}
          emptyText={__('There is no tag') + '.'}
          emptyImage="/images/actions/8.svg"
        />
      }
      leftSidebar={<Sidebar types={types} type={type} />}
      hasBorder={true}
      transparent={true}
    />
  );
}

export default List;
