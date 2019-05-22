import {
  Button,
  DataWithLoader,
  HeaderDescription,
  Pagination,
  Table
} from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { BarItems } from 'modules/layout/styles';
import { DataImporter } from 'modules/settings/importHistory/containers';
import * as React from 'react';
import Sidebar from '../../properties/components/Sidebar';
import { IImportHistory } from '../types';
import HistoryRow from './Row';

type Props = {
  queryParams: any;
  currentType: string;
  histories: IImportHistory[];
  removeHistory: (historyId: string) => void;
  loading: boolean;
  totalCount: number;
};

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

  renderImportButton = () => {
    const { currentType } = this.props;
    let url = 'https://s3.amazonaws.com/erxes/company_template.xlsx';

    if (currentType === 'customer') {
      url = 'https://s3.amazonaws.com/erxes/customer_template.xlsx';
    }

    return (
      <BarItems>
        <Button btnStyle="primary" size="small" icon="download-1" href={url}>
          {__('Download template')}
        </Button>
        <DataImporter
          type={currentType}
          text={`${__('Import')} ${currentType}`}
        />
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
      { title: __('Import histories'), link: '/settings/importHistories' },
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
                title="Import histories"
                description="Here you can find data of all your previous imports of companies and customers. Find out when they joined and their current status. Nothing goes missing around here."
              />
            }
            right={this.renderImportButton()}
          />
        }
        leftSidebar={
          <Sidebar title="Import histories" currentType={currentType} />
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
