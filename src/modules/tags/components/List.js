import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { ModalTrigger, Button, Table } from 'modules/common/components';
import Row from './Row';
import Form from './Form';
import Sidebar from './Sidebar';

const propTypes = {
  tags: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired
};

function List({ tags, type, remove, save }, { __ }) {
  const trigger = (
    <Button btnStyle="success" size="small" icon="add">
      Add tag
    </Button>
  );

  const actionBarRight = (
    <ModalTrigger title="Add tag" trigger={trigger}>
      <Form type={type} save={save} />
    </ModalTrigger>
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

List.propTypes = propTypes;
List.contextTypes = {
  __: PropTypes.func
};

export default List;
