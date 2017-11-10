import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Dropdown } from 'react-bootstrap';
import {
  ModalTrigger,
  Button,
  Icon,
  Table,
  DropdownToggle
} from 'modules/common/components';
import { BarItems } from 'modules/layout/styles';
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
    <Button btnStyle="success" size="small">
      <Icon icon="plus" /> Add tag
    </Button>
  );

  const actionBarRight = (
    <BarItems>
      <Dropdown id="dropdown-engage" pullRight>
        <DropdownToggle bsRole="toggle">
          <Button btnStyle="simple" size="small">
            Customize<Icon icon="ios-arrow-down" />
          </Button>
        </DropdownToggle>
        <Dropdown.Menu>
          <li>
            <Link to="/tags/engageMessage">Engage Message</Link>
          </li>
          <li>
            <Link to="/tags/conversation">Conversation</Link>
          </li>
          <li>
            <Link to="/tags/customer">Customer</Link>
          </li>
        </Dropdown.Menu>
      </Dropdown>
      <ModalTrigger title="Add tag" trigger={trigger}>
        <Form type={type} save={save} />
      </ModalTrigger>
    </BarItems>
  );

  const actionBar = <Wrapper.ActionBar right={actionBarRight} />;
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

  const breadcrumb = [
    { title: 'Tags', link: '/tags' },
    { title: 'conversation' }
  ];

  return (
    <Wrapper
      header={<Wrapper.Header breadcrumb={breadcrumb} />}
      actionBar={actionBar}
      content={content}
    />
  );
}

List.propTypes = propTypes;

export default List;
