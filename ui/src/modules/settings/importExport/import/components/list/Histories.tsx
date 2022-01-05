import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyContent from 'modules/common/components/empty/EmptyContent';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { IRouterProps } from 'modules/common/types';
import { getEnv, __ } from 'modules/common/utils';
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
  currentType: string;
  removeHistory: (historyId: string, contentType: string) => void;
};

const DYNAMICLY_TEMPLATE_TYPES = [
  'customer',
  'company',
  'deal',
  'task',
  'ticket',
  'lead',
  'visitor'
];

const DATA_IMPORT_TYPES = [
  'customer',
  'company',
  'deal',
  'task',
  'ticket',
  'lead'
];

class Histories extends React.Component<Props & IRouterProps> {
  renderHistories = () => {
    const { histories, removeHistory } = this.props;

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
            return (
              <HistoryRow
                key={history._id}
                history={history}
                removeHistory={removeHistory}
              />
            );
          })}
        </tbody>
      </Table>
    );
  };

  getButtonText() {
    const { currentType } = this.props;
    let buttonText = `${currentType}s`;

    switch (currentType) {
      case 'company':
        buttonText = 'companies';
        break;
      case 'deal':
        buttonText = 'sales pipelines';
        break;
      case 'user':
        buttonText = 'team members';
        break;
      default:
        break;
    }

    return buttonText;
  }

  renderExportButton = () => {
    const { currentType } = this.props;
    const { REACT_APP_API_URL } = getEnv();

    if (currentType === 'product') {
      return null;
    }

    const exportData = () => {
      window.open(
        `${REACT_APP_API_URL}/file-export?type=${currentType}`,
        '_blank'
      );
    };

    if (DYNAMICLY_TEMPLATE_TYPES.includes(currentType)) {
      return (
        <Link to={`/settings/export?type=${currentType}`}>
          <Button icon="export" btnStyle="primary" size="small">
            {__(`Export ${this.getButtonText()}`)}
          </Button>
        </Link>
      );
    }

    return (
      <Button
        icon="export"
        btnStyle="primary"
        size="small"
        onClick={exportData}
      >
        {__(`Export ${this.getButtonText()}`)}
      </Button>
    );
  };

  renderDataImporter() {
    const { currentType } = this.props;

    if (!DATA_IMPORT_TYPES.includes(currentType)) {
      return null;
    }

    return (
      <Link to={`/settings/import`}>
        <Button icon="import" btnStyle="success" size="small">
          {__(`Import data`)}
        </Button>
      </Link>
    );
  }

  renderImportButton = () => {
    return (
      <BarItems>
        {this.renderDataImporter()}
        {this.renderExportButton()}
      </BarItems>
    );
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
