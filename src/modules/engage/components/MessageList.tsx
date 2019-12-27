import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import FormControl from 'modules/common/components/form/Control';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import TaggerPopover from 'modules/tags/components/TaggerPopover';
import React from 'react';
import { Link } from 'react-router-dom';
import MessageListRow from '../containers/MessageListRow';
import Sidebar from '../containers/Sidebar';
import { ChooseBox, FlexContainer } from '../styles';
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

  renderBox(title, desc, url) {
    return (
      <ChooseBox>
        <Link to={url}>
          <b>{__(title)}</b>
          <p>{__(desc)}</p>
        </Link>
      </ChooseBox>
    );
  }

  renderRightActionBar = () => {
    const trigger = (
      <Button btnStyle="success" size="small" icon="add">
        {__('New message')}
      </Button>
    );

    const content = props => (
      <FlexContainer direction="column">
        {this.renderBox(
          'Auto message',
          'Auto message description',
          '/engage/messages/create?kind=auto'
        )}
        {this.renderBox(
          'Manual message',
          'Manual message description',
          '/engage/messages/create?kind=manual'
        )}
        {this.renderBox(
          'Visitor auto message',
          'Visitor auto message description',
          '/engage/messages/create?kind=visitorAuto'
        )}
      </FlexContainer>
    );

    return (
      <ModalTrigger
        title="New message"
        trigger={trigger}
        content={content}
        hideHeader={true}
        enforceFocus={false}
        centered={true}
      />
    );
  };

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

    const actionBar = (
      <Wrapper.ActionBar
        left={this.renderTagger()}
        right={this.renderRightActionBar()}
      />
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
