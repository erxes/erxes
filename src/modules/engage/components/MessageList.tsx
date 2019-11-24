import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import TaggerPopover from 'modules/tags/components/TaggerPopover';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import MessageListRow from '../containers/MessageListRow';
import Sidebar from '../containers/Sidebar';
import { MessageDescription } from '../styles';
import { IEngageMessage } from '../types';

type Props = {
  messages: IEngageMessage[];
  totalCount: number;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  toggleBulk: (target: IEngageMessage, toAdd: boolean) => void;
  toggleAll: (targets: IEngageMessage[], name: string) => void;
  loading: boolean;
  queryParams: any;
};

class List extends React.Component<Props> {
  onChange = () => {
    const { toggleAll, messages } = this.props;

    toggleAll(messages, 'engageMessages');
  };

  renderTagger() {
    const { bulk, emptyBulk } = this.props;

    const tagButton = (
      <Button btnStyle="simple" size="small" icon="tag-alt">
        {__('Tag')}
      </Button>
    );

    if (!bulk.length) {
      return null;
    }

    return (
      <TaggerPopover
        type="engageMessage"
        targets={bulk}
        trigger={tagButton}
        successCallback={emptyBulk}
      />
    );
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

    const actionBarRight = (
      <Dropdown alignRight={true}>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-engage">
          <Button btnStyle="success" size="small" icon="add">
            {__('New message')} <Icon icon="angle-down" />
          </Button>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <li>
            <Link to={'/engage/messages/create?kind=auto'}>
              {__('Auto message')}
              <MessageDescription>
                {__('Auto message description')}
              </MessageDescription>
            </Link>
          </li>
          <li>
            <Link to={'/engage/messages/create?kind=manual'}>
              {__('Manual message')}
              <MessageDescription>
                {__('Manual message description')}
              </MessageDescription>
            </Link>
          </li>
          <li>
            <Link to={'/engage/messages/create?kind=visitorAuto'}>
              {__('Visitor auto message')}
              <MessageDescription>
                {__('Visitor auto message description')}
              </MessageDescription>
            </Link>
          </li>
        </Dropdown.Menu>
      </Dropdown>
    );

    const actionBar = (
      <Wrapper.ActionBar left={this.renderTagger()} right={actionBarRight} />
    );

    const mainContent = (
      <Table whiteSpace="nowrap" hover={true} bordered={true}>
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
            title={__('Engage')}
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
            emptyText="A strong customer engagement can help to further brand growth and loyalty"
            emptyImage="/images/actions/14.svg"
          />
        }
      />
    );
  }
}

export default List;
