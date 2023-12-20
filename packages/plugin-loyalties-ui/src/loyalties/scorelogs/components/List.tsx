import {
  Button,
  DataWithLoader,
  ModalTrigger,
  Pagination,
  SortHandler,
  Table,
  __
} from '@erxes/ui/src';
import { BarItems, Wrapper } from '@erxes/ui/src/layout';
import { Title } from '@erxes/ui/src/styles/main';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { menuLoyalties } from '../../common/constants';
import Sidebar from '../components/Sidebar';
import Form from '../containers/Form';
import { IScore } from '../types';
import Row from './Row';

interface IProps extends IRouterProps {
  loading: boolean;
  error: any;
  queryParams: any;
  history: any;
  scoreLogs: IScore[];
  total: number;
  refetch: (variables: any) => void;
}

class ScoreLogsListComponent extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  renderContent() {
    const { scoreLogs } = this.props;
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Email')}</th>
            <th>{__('Owner Name')}</th>
            <th>{__('Owner Type')}</th>
            <th>
              <SortHandler sortField="changedScore" />
              {__('Changed Score')}
            </th>
            <th>
              <SortHandler sortField="totalScore" />
              {__('Total Score')}
            </th>
            <th>
              <SortHandler sortField="createdAt" />
              {__('Created At')}
            </th>
            {/* {tablehead.map((head, i) => (
              <th key={i}>{head}</th>
            ))} */}
          </tr>
        </thead>
        <tbody>
          {scoreLogs?.map(item => (
            <Row key={item._id} item={item} />
          ))}
        </tbody>
      </Table>
    );
  }

  renderForm() {
    const content = ({ closeModal }) => <Form closeModal={closeModal} />;
    const trigger = <Button btnStyle="success">{__('Give Score')}</Button>;

    return (
      <ModalTrigger title="Give Score" trigger={trigger} content={content} />
    );
  }

  render() {
    const { loading, queryParams, history, total, refetch } = this.props;

    const header = (
      <Wrapper.Header title={__('Score') + `(${1})`} submenu={menuLoyalties} />
    );

    const sidebar = (
      <Sidebar
        loadingMainQuery={loading}
        queryParams={queryParams}
        history={history}
        refetch={refetch}
      />
    );

    const rightActionBar = <BarItems>{this.renderForm()}</BarItems>;

    const content = (
      <>
        <Wrapper.ActionBar
          left={<Title>All Score List</Title>}
          right={rightActionBar}
        />
        <DataWithLoader
          data={this.renderContent()}
          loading={loading}
          count={total}
          emptyText="Empty list"
          emptyImage="/images/actions/1.svg"
        />
      </>
    );

    return (
      <Wrapper
        header={header}
        leftSidebar={sidebar}
        content={content}
        footer={<Pagination count={total} />}
        hasBorder
      />
    );
  }
}

export default ScoreLogsListComponent;
