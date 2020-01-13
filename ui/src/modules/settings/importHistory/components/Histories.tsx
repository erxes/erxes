import { getEnv } from 'apolloClient';
import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { IRouterProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { BarItems } from 'modules/layout/styles';
import DataImporter from 'modules/settings/importHistory/containers/DataImporter';
import React from 'react';
import { IImportHistory } from '../types';
import HistoryRow from './Row';
import Sidebar from './Sidebar';

type Props = {
  queryParams: any;
  currentType: string;
  histories: IImportHistory[];
  removeHistory: (historyId: string) => void;
  loading: boolean;
  totalCount: number;
};

// currently support import data types
const DATA_IMPORT_TYPES = ['customer', 'company', 'product'];

class Histories extends React.Component<Props & IRouterProps> {
  renderHistories = () => {
    const { histories, removeHistory } = this.props;

    return (
      <Table hover={true}>
        <thead>
          <tr>
            <th>{__('Success')}</th>
            <th>{__('Failed')}</th>
            <th>{__('Total')}</th>
            <th>{__('Imported Date')}</th>
            <th>{__('Imported User')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {histories.map(history => {
            return (
              <HistoryRow
                key={history._id}
                history={history}
                removeHistory={removeHistory}
                onClick={this.onClick}
              />
            );
          })}
        </tbody>
      </Table>
    );
  };

  renderTemplateButton() {
    const { REACT_APP_API_URL } = getEnv();
    const { currentType } = this.props;

    if (!DATA_IMPORT_TYPES.includes(currentType)) {
      return null;
    }

    let name = 'company_template.xlsx';

    if (currentType === 'customer') {
      name = 'customer_template.xlsx';
    }

    if (currentType === 'product') {
      name = 'product_template.xlsx';
    }

    return (
      <Button
        btnStyle="simple"
        size="small"
        icon="folder-download"
        href={`${REACT_APP_API_URL}/download-template/?name=${name}`}
      >
        {__('Download template')}
      </Button>
    );
  }

  renderDataImporter() {
    const { currentType } = this.props;

    if (!DATA_IMPORT_TYPES.includes(currentType)) {
      return null;
    }

    return (
      <DataImporter
        type={currentType}
        text={`${__('Import')} ${currentType}`}
      />
    );
  }

  renderExportButton = () => {
    const { currentType } = this.props;
    const { REACT_APP_API_URL } = getEnv();
    let buttonText = `${currentType}s`;

    if (currentType === 'product') {
      return null;
    }

    const exportData = () => {
      window.open(
        `${REACT_APP_API_URL}/file-export?type=${currentType}`,
        '_blank'
      );
    };

    switch (currentType) {
      case 'company':
        buttonText = 'companies';
        break;
      case 'deal':
        buttonText = 'Sales pipelines';
        break;
      case 'user':
        buttonText = 'Team members';
        break;
      default:
        break;
    }

    return (
      <Button
        icon="export"
        btnStyle="primary"
        size="small"
        onClick={exportData}
      >
        {__(`Export ${buttonText}`)}
      </Button>
    );
  };

  renderImportButton = () => {
    return (
      <BarItems>
        {this.renderTemplateButton()}
        {this.renderDataImporter()}
        {this.renderExportButton()}
      </BarItems>
    );
  };

  onClick = id => {
    const { history } = this.props;

    history.push(`/settings/importHistory/${id}`);
  };

  render() {
    const { currentType, histories, loading, totalCount } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Import & Export'), link: '/settings/importHistories' },
      { title: __(currentType) }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__(currentType)} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={
              <HeaderDescription
                icon="/images/actions/27.svg"
                title="Import & export"
                description="Here you can find data of all your previous imports of companies and customers. Find out when they joined and their current status. Nothing goes missing around here."
              />
            }
            right={this.renderImportButton()}
          />
        }
        leftSidebar={
          <Sidebar title="Import & export" currentType={currentType} />
        }
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={this.renderHistories()}
            loading={loading}
            count={histories.length}
            emptyText="Oh dear! You have no imports"
            emptyImage="/images/actions/15.svg"
          />
        }
      />
    );
  }
}

export default Histories;
