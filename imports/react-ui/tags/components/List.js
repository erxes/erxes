import React, { PropTypes } from 'react';
import { Table, Button } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import { ModalTrigger } from '/imports/react-ui/common';
import Row from './Row';
import { Form } from '../containers';

const propTypes = {
  tags: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
  remove: PropTypes.object.isRequired,
};

function List({ tags, type, remove }) {
  const trigger = (
    <Button bsStyle="link">
      <i className="ion-plus-circled" /> Add tag
    </Button>
  );

  const actionBarLeft = (
    <ModalTrigger title="Add tag" trigger={trigger}>
      <Form type={type} />
    </ModalTrigger>
  );

  const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;
  const content = (
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {tags.map(tag => <Row key={tag._id} tag={tag} type={type} remove={remove} />)}
      </tbody>
    </Table>
  );

  return (
    <div>
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'Tags' }]} />}
        actionBar={actionBar}
        content={content}
      />
    </div>
  );
}

List.propTypes = propTypes;

export default List;
