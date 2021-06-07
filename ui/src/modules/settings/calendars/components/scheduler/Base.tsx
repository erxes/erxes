import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Table from 'modules/common/components/table';
import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { router as routerUtils } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import { ICalendar, IPage } from '../../types';
import PageRow from './PageRow';
import Sidebar from './Sidebar';

type Props = {
  pages: IPage[];
  calendars: ICalendar[];
  history: any;
  queryParams: { accountId?: string };
  remove: (pageId: string) => void;
};

class Base extends React.Component<Props> {
  componentDidMount() {
    const { calendars, queryParams, history } = this.props;

    if (calendars.length > 0 && !queryParams.accountId) {
      routerUtils.setParams(history, { accountId: calendars[0].accountId });
    }
  }

  renderButtons() {
    if (this.props.calendars.length === 0) {
      return;
    }

    return (
      <Button btnStyle="success" icon="plus-circle" uppercase={false}>
        <Link
          to={`/settings/schedule/create/${this.props.queryParams.accountId}`}
        >
          Add New Page
        </Link>
      </Button>
    );
  }

  render() {
    const { pages, calendars, queryParams, remove } = this.props;
    const { accountId } = queryParams;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Calendar'), link: `/settings/calendars` },
      { title: __('Schedule'), link: '' }
    ];

    let calendarName = '';

    if (accountId) {
      calendarName = (
        calendars.find(c => c.accountId === accountId) || ({} as ICalendar)
      ).name;
    }

    const content =
      accountId && calendars.length > 0 ? (
        <div>
          <Wrapper.ActionBar
            left={<Title>{calendarName}</Title>}
            right={this.renderButtons()}
          />

          <Table>
            <thead>
              <tr>
                <th>{__('Your Scheduling Pages')}</th>
                <th> {__('Action')}</th>
              </tr>
            </thead>

            <tbody>
              {pages.map(page => (
                <PageRow
                  key={page._id}
                  page={page}
                  accountId={accountId}
                  remove={remove}
                />
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <EmptyState
          text={`Get started on your board`}
          image="/images/actions/16.svg"
        />
      );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Schedule')} breadcrumb={breadcrumb} />
        }
        leftSidebar={
          calendars.length > 1 && (
            <Sidebar accountId={accountId} calendars={calendars} />
          )
        }
        mainHead={
          <HeaderDescription
            icon="/images/actions/34.svg"
            title={`Calendar & Schedule`}
            description={`${__(
              "Manage your boards and calendars so that its easy to manage incoming pop ups or requests that is adaptable to your team's needs"
            )}.${__(
              `Add in or delete boards and calendars to keep business development on track and in check`
            )}`}
          />
        }
        content={content}
      />
    );
  }
}

export default Base;
