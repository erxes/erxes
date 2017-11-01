import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { ModalTrigger, Button, Icon, Table } from 'modules/common/components';
import Row from './Row';
import Form from './Form';

const propTypes = {
  tags: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired
};

function List({ tags, type, remove, save }) {
  const trigger = (
    <Button btnStyle="success">
      <Icon icon="plus" /> Add tag
    </Button>
  );

  const actionBarLeft = (
    <ModalTrigger title="Add tag" trigger={trigger}>
      <Form type={type} save={save} />
    </ModalTrigger>
  );

  const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;
  const content = (
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tags.map(tag => (
          <Row
            key={tag._id}
            tag={tag}
            type={type}
            save={save}
            remove={remove}
          />
        ))}
      </tbody>
    </Table>
  );

  return (
    <Wrapper
      header={<Wrapper.Header breadcrumb={[{ title: 'Tags' }]} />}
      actionBar={actionBar}
      content={content}
    />
  );
}

List.propTypes = propTypes;

export default List;
