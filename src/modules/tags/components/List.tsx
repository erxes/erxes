import { Button, ModalTrigger, Table } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { ITag, ITagSaveParams } from 'modules/tags/types';
import * as React from 'react';
import Form from './Form';
import Row from './Row';
import Sidebar from './Sidebar';

type Props = {
  tags: ITag[];
  type: string;
  remove: (tag: ITag) => void;
  save: (params: ITagSaveParams) => void;
};

function List({ tags, type, remove, save }: Props) {
  const trigger = (
    <Button btnStyle="success" size="small" icon="add">
      Add tag
    </Button>
  );

  const actionBarRight = (
    <ModalTrigger
      title="Add tag"
      trigger={trigger}
      content={props => <Form {...props} type={type} save={save} />}
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
            save={save}
            remove={remove}
          />
        ))}
      </tbody>
    </Table>
  );

  const breadcrumb = [
    { title: __('Tags'), link: '/tags' },
    { title: __(type) }
  ];

  return (
    <Wrapper
      header={<Wrapper.Header breadcrumb={breadcrumb} />}
      actionBar={actionBar}
      content={content}
      leftSidebar={<Sidebar />}
    />
  );
}

export default List;
