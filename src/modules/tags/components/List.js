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

function List({ tags, type, remove, save }, { __ }) {
  const trigger = (
    <Button btnStyle="success" size="small" icon="plus">
      Add tag
    </Button>
  );

  const actionBarRight = (
    <BarItems>
      <Dropdown id="dropdown-engage" pullRight>
        <DropdownToggle bsRole="toggle">
          <Button btnStyle="simple" size="small">
            {__('Customize ')} <Icon icon="ios-arrow-down" />
          </Button>
        </DropdownToggle>
        <Dropdown.Menu>
          <li>
            <Link to="/tags/engageMessage">{__('Engage Message')}</Link>
          </li>
          <li>
            <Link to="/tags/conversation">{__('Conversation')}</Link>
          </li>
          <li>
            <Link to="/tags/customer">{__('Customer')}</Link>
          </li>
          <li>
            <Link to="/tags/company">{__('Company')}</Link>
          </li>
          <li>
            <Link to="/tags/form">{__('Form')}</Link>
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
    />
  );
}

List.propTypes = propTypes;
List.contextTypes = {
  __: PropTypes.func
};

export default List;
