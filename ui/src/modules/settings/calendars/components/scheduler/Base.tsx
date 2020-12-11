import Button from 'modules/common/components/Button';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Table from 'modules/common/components/table';
import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import PageRow from './PageRow';

type Props = {
  pages: any[];
  accessToken: string;
  name: string;
  refetchQueries: () => void;
};

declare function manageSchedulingPage(
  accessToken: string,
  inDarkMode: boolean
): any;

class Base extends React.Component<Props> {
  managePages = () => {
    manageSchedulingPage(this.props.accessToken, false);

    this.props.refetchQueries();
  };

  render() {
    const { pages, name } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Calendar'), link: `/settings/calendars` },
      { title: __('Schedule'), link: '' }
    ];

    const content = (
      <div>
        <Wrapper.ActionBar
          left={<Title>{name}</Title>}
          right={
            <Button onClick={this.managePages} btnStyle="success">
              Manage scheduling pages
            </Button>
          }
        />

        <Table>
          <thead>
            <tr>
              <th>Your Scheduling Pages</th>
              <th> Action</th>
            </tr>
          </thead>

          <tbody>
            {pages.map(page => (
              <PageRow key={page.id} page={page} />
            ))}
          </tbody>
        </Table>
      </div>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Schedule')} breadcrumb={breadcrumb} />
        }
        mainHead={
          <HeaderDescription
            icon="/images/actions/34.svg"
            title={`Calendar & Schedule`}
            description="Manage your boards and calendars so that its easy to manage incoming pop ups or requests that is adaptable to your team's needs. Add in or delete boards and calendars to keep business development on track and in check."
          />
        }
        content={content}
      />
    );
  }
}

export default Base;
