import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyContent from 'modules/common/components/empty/EmptyContent';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { IRouterProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { BarItems } from 'modules/layout/styles';
import { EMPTY_IMPORT_CONTENT } from 'modules/settings/constants';
import React from 'react';
import { IImportHistory } from '../../../types';
import HistoryRow from './HistoryRow';
import Sidebar from './SideBar';
import { Title } from 'modules/common/styles/main';
import { Link } from 'react-router-dom';

type Props = {
  queryParams: any;
  histories: IImportHistory[];
  loading: boolean;
  totalCount: number;
};

class Histories extends React.Component<Props & IRouterProps> {
  renderHistories = () => {
    const { histories } = this.props;

    return (
      <Table hover={true}>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('New records')}</th>
            <th>{__('Updated records')}</th>
            <th>{__('Error Count')}</th>
            <th>{__('User')}</th>
            <th>{__('Date')}</th>
            <th>{__('Action')}</th>
          </tr>
        </thead>
        <tbody>
          {histories.map(history => {
            return <HistoryRow key={history._id} history={history} />;
          })}
        </tbody>
      </Table>
    );
  };

  renderDataImporter() {
    return (
      <Link to={`/settings/import`}>
        <Button icon="import" btnStyle="success" size="small">
          {__(`Import data`)}
        </Button>
      </Link>
    );
  }

  renderImportButton = () => {
    return <BarItems>{this.renderDataImporter()}</BarItems>;
  };

  render() {
    const { histories, loading, totalCount, queryParams } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Import & Export'), link: '/settings/importHistories' },
      { title: __('Imports') }
    ];

    const headerDescription = (
      <HeaderDescription
        icon="/images/actions/27.svg"
        title={__('Import & export')}
        description={`${__(
          'Here you can find data of all your previous imports of companies and customers'
        )}.${__('Find out when they joined and their current status')}.${__(
          'Nothing goes missing around here'
        )}`}
      />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Imports')} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title capitalize={true}>{__('Imports')}</Title>}
            right={this.renderImportButton()}
          />
        }
        leftSidebar={<Sidebar currentType={queryParams.type} />}
        mainHead={headerDescription}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={this.renderHistories()}
            loading={loading}
            count={histories.length}
            emptyContent={<EmptyContent content={EMPTY_IMPORT_CONTENT} />}
          />
        }
      />
    );
  }
}

export default Histories;
