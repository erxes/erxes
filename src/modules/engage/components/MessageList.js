import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import { Pagination } from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import {
  FormControl,
  DropdownToggle,
  Table,
  Button,
  Icon,
  DataWithLoader
} from 'modules/common/components';
import { TaggerPopover } from 'modules/tags/components';
import { MessageListRow, Sidebar } from '../containers';

const propTypes = {
  messages: PropTypes.array.isRequired,
  totalCount: PropTypes.number.isRequired,
  bulk: PropTypes.array.isRequired,
  isAllSelected: PropTypes.bool,
  emptyBulk: PropTypes.func.isRequired,
  toggleBulk: PropTypes.func.isRequired,
  toggleAll: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  queryParams: PropTypes.object
};

class List extends React.Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange() {
    const { toggleAll, messages } = this.props;

    toggleAll(messages, 'engageMessages');
  }

  renderTagger() {
    const { bulk, emptyBulk } = this.props;
    const { __ } = this.context;

    const tagButton = (
      <Button btnStyle="simple" size="small">
        {__('Tag')} <Icon icon="downarrow" />
      </Button>
    );

    if (bulk.length) {
      return (
        <TaggerPopover
          type="engageMessage"
          targets={bulk}
          trigger={tagButton}
          refetchQueries={['tagCounts', 'engageMessages']}
          successCallback={emptyBulk}
        />
      );
    }
  }

  render() {
    const {
      messages,
      totalCount,
      bulk,
      toggleBulk,
      loading,
      queryParams,
      isAllSelected
    } = this.props;

    const { __ } = this.context;

    const actionBarRight = (
      <Dropdown id="dropdown-engage" pullRight>
        <DropdownToggle bsRole="toggle">
          <Button btnStyle="success" size="small" icon="add">
            {__('New message')} <Icon icon="downarrow" />
          </Button>
        </DropdownToggle>

        <Dropdown.Menu>
          <li>
            <Link to={'/engage/messages/create?kind=auto'}>
              {__('Auto message')}
            </Link>
          </li>
          <li>
            <Link to={'/engage/messages/create?kind=manual'}>
              {__('Manual message')}
            </Link>
          </li>
          <li>
            <Link to={'/engage/messages/create?kind=visitorAuto'}>
              {__('Visitor auto message')}
            </Link>
          </li>
        </Dropdown.Menu>
      </Dropdown>
    );

    const actionBar = (
      <Wrapper.ActionBar left={this.renderTagger()} right={actionBarRight} />
    );

    const mainContent = (
      <Table whiteSpace="nowrap" hover bordered>
        <thead>
          <tr>
            <th>
              <FormControl
                checked={isAllSelected}
                componentClass="checkbox"
                onChange={this.onChange}
              />
            </th>
            <th>{__('Title')}</th>
            <th>{__('From')}</th>
            <th>{__('Status')}</th>
            <th>{__('Total')}</th>
            <th>{__('Type')}</th>
            <th>{__('Brand')}</th>
            <th>{__('Created date')}</th>
            <th>{__('Tags')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody id="engageMessages">
          {messages.map(message => (
            <MessageListRow
              isChecked={bulk.includes(message)}
              toggleBulk={toggleBulk}
              key={message._id}
              message={message}
              queryParams={queryParams}
            />
          ))}
        </tbody>
      </Table>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            breadcrumb={[{ title: __('Engage') }]}
            queryParams={queryParams}
          />
        }
        leftSidebar={<Sidebar queryParams={queryParams} />}
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={mainContent}
            loading={loading}
            count={messages.length}
            emptyText="There is no engage message."
            emptyImage="/images/robots/robot-03.svg"
          />
        }
      />
    );
  }
}

List.propTypes = propTypes;
List.contextTypes = {
  __: PropTypes.func
};

export default List;
