import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __, getEnv } from '@erxes/ui/src/utils/core';
import React from 'react';

// import CategoryForm from '../containers/Form';
// import { tumentechMenu } from '../list/CarsList';
import { menu } from '../../../routes';
import Row from './Row';
import Sidebar from './Sidebar';
import Button from '@erxes/ui/src/components/Button';
import colors from '@erxes/ui/src/styles/colors';


type Props = {
  items: any[];
  totalCount: number;
  queryParams: any;
  history: any;
  loading: boolean;
  remove: (id: string) => void;
  refetch?: () => void;
};

const List = (props: Props) => {
  const { totalCount, queryParams, loading, items, remove } = props;
  const [exportUrl, setExportUrl] = React.useState('');

  React.useEffect(() => {
    const { REACT_APP_API_URL = 'http://localhost:4000' } = getEnv();
    const query = new URLSearchParams(queryParams).toString();

    setExportUrl(`${REACT_APP_API_URL}/pl:insurance/export?${query}`);
  }, []);

  const renderRow = () => {
    return items.map((item) => (
      <Row key={item._id} item={item} remove={remove} history={props.history} />
    ));
  };

  const onClick = () => {
    const { REACT_APP_API_URL = 'http://localhost:4000' } = getEnv();

    const query = new URLSearchParams(queryParams).toString();

    // window.open(`${REACT_APP_API_URL}/pl:insurance/export?`, '_blank');

    window.open(`${REACT_APP_API_URL}/pl:insurance/export?${query}`, '_blank');
  };

  // display: inline-block;
  // padding: 10px 20px;
  // font-size: 16px;
  // background-color: #007bff;
  // color: #fff;
  // text-decoration: none;
  // border: none;
  // border-radius: 4px;
  // cursor: pointer;

  const buttonStyle = {
    display: 'inline-block',
    padding: '3px 10px',
    fontSize: '12px',
    backgroundColor: colors.colorCoreGreen,
    color: '#fff',
    textDecoration: 'none',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const actionButton = (
    // <Button btnStyle="success" size="small" icon="file-alt" onClick={onClick}>
    //   Export
    // </Button>
    
    <a target="_blank" rel="noopener noreferrer" href={exportUrl} style={buttonStyle}>
      Export
    </a>
  );

  const actionBar = <Wrapper.ActionBar right={actionButton} />;

  const content = (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>{__('Contract Number')}</th>
          <th>{__('Product Name')}</th>
          <th>{__('Vendor')}</th>
          <th>{__('Created By')}</th>
          <th>{'Stage'}</th>
          <th>{__('Created Date')}</th>

          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>{renderRow()}</tbody>
    </Table>
  );
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Items')}
          queryParams={queryParams}
          submenu={menu}
        />
      }
      actionBar={actionBar}
      leftSidebar={
        <Sidebar loadingMainQuery={loading} queryParams={queryParams} />
      }
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={totalCount}
          emptyContent={
            <h3
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              no data
            </h3>
          }
        />
      }
    />
  );
};

export default List;
