import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyContent from 'modules/common/components/empty/EmptyContent';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';

import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { BarItems } from 'modules/layout/styles';

import React from 'react';
import { IExportHistory } from '../../types';
import HistoryRow from './HistoryRow';
import Sidebar from '../../common/containers/SideBar';
import { Title } from '@erxes/ui-settings/src/styles';
import { Link } from 'react-router-dom';
import { EMPTY_IMPORT_CONTENT } from '@erxes/ui-settings/src/constants';
import { IRouterProps } from '@erxes/ui/src/types';

type Props = {
  queryParams: any;
  history: any;
  histories: IExportHistory[];
  loading: boolean;
  totalCount: number;
  currentType: string;
};

class ExportHistories extends React.Component<Props & IRouterProps> {
  renderHistories = () => {
    const { histories } = this.props;

    return (
      <Table hover={true}>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Status')}</th>
            <th>{__('Total')}</th>
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

  renderExportButton = () => {
    const { currentType } = this.props;

    if (currentType) {
      return (
        <Link to={`/settings/export?type=${currentType}`}>
          <Button icon="export" btnStyle="primary">
            {__(`Export`)}
          </Button>
        </Link>
      );
    }

    return (
      <Button icon="export" btnStyle="primary" disabled={true}>
        {__('Export')}
      </Button>
    );
  };

  renderImportButton = () => {
    return <BarItems>{this.renderExportButton()}</BarItems>;
  };

  render() {
    const { histories, loading, totalCount, history, currentType } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Import & Export'), link: '/settings/selectMenu' },
      { title: __('Exports') }
    ];

    const headerDescription = (
      <HeaderDescription
        icon="/images/actions/27.svg"
        title={__('Export')}
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
          <Wrapper.Header title={__('Exports')} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title capitalize={true}>{__('Exports')}</Title>}
            right={this.renderImportButton()}
            wideSpacing={true}
          />
        }
        leftSidebar={
          <Sidebar
            history={history}
            currentType={currentType}
            mainType="export"
          />
        }
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
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default ExportHistories;
