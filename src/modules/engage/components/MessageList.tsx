import { Pagination } from 'modules/common/components';
import {
  Button,
  DataWithLoader,
  DropdownToggle,
  FormControl,
  Icon,
  Table
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { TaggerPopover } from 'modules/tags/components';
import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MessageListRow, Sidebar } from '../containers';
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
      <Button btnStyle="simple" size="small">
        {__('Tag')} <Icon icon="downarrow" />
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
      <Dropdown id="dropdown-engage" pullRight={true}>
        <DropdownToggle bsRole="toggle">
          <Button btnStyle="success" size="small" icon="add">
            {__('New message')} <Icon icon="downarrow" />
          </Button>
        </DropdownToggle>

        <Dropdown.Menu>
          <li>
            <Link to={'/engage/messages/create?kind=auto'}>
              {__('Auto message')}
              <MessageDescription>
                {__(
                  'Send targeted email and chat to logged-in users based on their brand/tag/segment. You can set your time to send an email or chat in advance. Chat design can be snipped, badge and full message and it can be a text or video'
                )}
              </MessageDescription>
            </Link>
          </li>
          <li>
            <Link to={'/engage/messages/create?kind=manual'}>
              {__('Manual message')}
              <MessageDescription>
                {__(
                  'Send targeted email and chat to logged-in users based on their brand/tag/segment. An email or chat will be sent out immediately after you click save button. Chat design can be snipped, badge and full message and it can be a text or video'
                )}
              </MessageDescription>
            </Link>
          </li>
          <li>
            <Link to={'/engage/messages/create?kind=visitorAuto'}>
              {__('Visitor auto message')}
              <MessageDescription>
                {__(
                  'Send targeted chats to logged-out visitors on website based on their visiting page, activity, their country of residence and city. Chat design can be snipped, badge and full message and it can be a text or video'
                )}
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
