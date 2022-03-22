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
import { IImportHistory } from '../../../types';
import HistoryRow from './HistoryRow';
import Sidebar from '../../containers/list/SideBar';
import { Title } from 'modules/common/styles/main';
import { Link } from 'react-router-dom';
import { EMPTY_IMPORT_CONTENT } from '@erxes/ui-settings/src/constants';
import { IRouterProps } from '@erxes/ui/src/types';
import BreadCrumb from '@erxes/ui/src/components/breadcrumb/NewBreadCrumb';

type Props = {
  queryParams: any;
  histories: IImportHistory[];
  loading: boolean;
  totalCount: number;
  currentType: string;
  serviceType: string;
  removeHistory: (historyId: string, contentType: string) => void;
};

// currently support import data types
// const DATA_IMPORT_TYPES = [
//   'customer',
//   'company',
//   'product',
//   'deal',
//   'task',
//   'ticket',
//   'lead'
// ];

// const DYNAMICLY_TEMPLATE_TYPES = [
//   'customer',
//   'company',
//   'deal',
//   'task',
//   'ticket',
//   'lead',
//   'visitor'
// ];

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
                // onClick={this.onClick}
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

  // renderColumnChooser = (type: string) => {
  //   const { currentType } = this.props;

  //   let icon = '';
  //   let btnStyle = '';
  //   let text = '';

  //   switch (type) {
  //     case 'import':
  //       icon = 'folder-download';
  //       btnStyle = 'success';
  //       text = 'Download template';
  //       break;

  //     case 'export':
  //       icon = 'export';
  //       btnStyle = 'primary';
  //       text = `Export ${this.getButtonText()}`;
  //       break;
  //   }

  //   const manageColumns = props => {
  //     return (
  //       <ManageColumns
  //         {...props}
  //         contentType={currentType}
  //         type={type}
  //         isImport={true}
  //       />
  //     );
  //   };

  //   const editColumns = (
  //     <Button btnStyle={btnStyle} size="medium" icon={icon}>
  //       {__(`${text}`)}
  //     </Button>
  //   );

  //   return (
  //     <ModalTrigger
  //       title="Select Columns"
  //       trigger={editColumns}
  //       content={manageColumns}
  //       autoOpenKey="showManageColumnsModal"
  //     />
  //   );
  // };

  // renderTemplateButton() {
  //   const { REACT_APP_API_URL } = getEnv();
  //   const { currentType } = this.props;

  //   if (!DATA_IMPORT_TYPES.includes(currentType)) {
  //     return null;
  //   }

  //   if (DYNAMICLY_TEMPLATE_TYPES.includes(currentType)) {
  //     return this.renderColumnChooser('import');
  //   }

  //   let name = 'product_template.csv';

  //   switch (currentType) {
  //     case 'product':
  //       name = 'product_template.csv';
  //       break;
  //     case 'deal':
  //     case 'task':
  //     case 'ticket':
  //       name = 'board_item_template.csv';
  //       break;
  //     default:
  //       break;
  //   }

  //   return (
  //     <Button
  //       btnStyle="simple"
  //       size="medium"
  //       icon="folder-download"
  //       href={`${REACT_APP_API_URL}/download-template/?name=${name}`}
  //     >
  //       {__('Download template')}
  //     </Button>
  //   );
  // }

  // renderDataImporter() {
  //   const { currentType } = this.props;

  //   if (!DATA_IMPORT_TYPES.includes(currentType)) {
  //     return null;
  //   }

  //   return (
  //     <DataImporter
  //       type={currentType}
  //       text={`${__('Import')} ${this.getButtonText()}`}
  //     />
  //   );
  // }

  renderExportButton = () => {
    const { currentType, serviceType } = this.props;
    // const { REACT_APP_API_URL } = getEnv();

    // if (currentType === 'product') {
    //   return null;
    // }

    // const exportData = () => {
    //   window.open(
    //     `${REACT_APP_API_URL}/file-export?type=${currentType}`,
    //     '_blank'
    //   );
    // };

    // if (DYNAMICLY_TEMPLATE_TYPES.includes(currentType)) {
      return (
        <Link
          to={`/settings/export?type=${currentType}&serviceType=${serviceType}`}
        >
          <Button icon="export" btnStyle="primary">
            {__(`Export ${this.getButtonText()}`)}
          </Button>
        </Link>
      );
    };

  //   return (
  //     <Button
  //       icon="export"
  //       btnStyle="primary"
  //       size="medium"
  //       onClick={exportData}
  //     >
  //       {__(`Export ${this.getButtonText()}`)}
  //     </Button>
  //   );
  // };

  // renderExportPopupsData() {
  //   if (this.props.currentType !== 'customer') {
  //     return null;
  //   }

  //   return <ExportPopupsData />;
  // }
  renderDataImporter() {
    return (
      <Link to={`/settings/import`}>
        <Button icon="import" btnStyle="success" >
          {__(`Import data`)}
        </Button>
      </Link>
    );
  }

  renderImportButton = () => {
    return (
      <BarItems>
        {/* {this.renderTemplateButton()} */}
        {this.renderDataImporter()}
        {this.renderExportButton()}
        {/* {this.renderExportPopupsData()} */}
      </BarItems>
    );
  };

  // onClick = id => {
  //   const { history } = this.props;

  //   history.push(`/settings/importHistory/${id}`);
  // };

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
        subheader={headerDescription}
        actionBar={
          <Wrapper.ActionBar
            background="bgActive"
            left={<Title capitalize={true}>{__('Imports')}</Title>}
            right={this.renderImportButton()}
          />
        }
        leftSidebar={<Sidebar currentType={queryParams.type} />}
        mainHead={<BreadCrumb breadcrumbs={breadcrumb}/>}
        footer={<Pagination count={totalCount} />}
        settings={true}
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
