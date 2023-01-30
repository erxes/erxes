import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { EMPTY_CONTENT_POPUPS } from '@erxes/ui-settings/src/constants';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Row from './Row';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import { IPage } from '../../types';
import FormControl from '@erxes/ui/src/components/form/Control';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import PageForm from './PageForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';

type Props = {
  pages: IPage[];
  queryParams?: any;
  loading?: boolean;
  remove?: (integrationId: string) => void;
  refetch?: () => void;
  history?: any;
  bulk: any[];
  isAllSelected: boolean;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  toggleBulk: (target: IPage, toAdd: boolean) => void;
  toggleAll: (targets: IPage[], containerId: string) => void;
};

class List extends React.Component<Props, {}> {
  renderRow() {
    const { pages, remove, bulk, toggleBulk, renderButton } = this.props;

    return pages.map(page => (
      <Row
        key={page._id}
        page={page}
        isChecked={bulk.includes(page)}
        toggleBulk={toggleBulk}
        remove={remove}
        renderButton={renderButton}
        history={history}
      />
    ));
  }

  renderForm = props => {
    return <PageForm {...props} renderButton={this.props.renderButton} />;
  };

  render() {
    const {
      queryParams,
      loading,
      pages,
      isAllSelected,
      bulk,
      toggleAll
    } = this.props;

    let actionBarLeft: React.ReactNode;

    queryParams.loadingMainQuery = loading;

    if (bulk.length > 0) {
      const onClick = () => confirm('Are you sure? This cannot be undone.');
      // .then(() => {
      //     this.deletePost(bulk);
      //   })
      //   .catch(e => {
      //     Alert.error(e.message);
      //   });

      actionBarLeft = (
        <Button
          btnStyle="danger"
          size="small"
          icon="times-circle"
          onClick={onClick}
        >
          Delete
        </Button>
      );
    }

    const actionBarRight = (
      <ModalTrigger
        title="Create New Page"
        size="lg"
        trigger={
          <Button btnStyle="success" size="small" icon="plus-circle">
            Create New Page
          </Button>
        }
        content={this.renderForm}
      />
    );

    const onChange = () => {
      toggleAll(pages, 'pages');
    };

    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
    );

    const content = (
      <Table whiteSpace="nowrap" hover={true}>
        <thead>
          <tr>
            <th>
              <FormControl
                checked={isAllSelected}
                componentClass="checkbox"
                onChange={onChange}
              />
            </th>
            <th>
              <SortHandler sortField={'title'} label={__('Title')} />
            </th>
            <th>{__('Code')}</th>
            <th>
              <SortHandler
                sortField={'leadData.listOrder'}
                label={__('List Order')}
              />
            </th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    const submenu = [
      { title: 'Posts', link: '/forums/posts' },
      { title: 'Pages', link: '/forums/pages' }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Pages')}
            queryParams={queryParams}
            submenu={submenu}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={pages.length} />}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={pages.length}
            emptyContent={
              <EmptyContent
                content={EMPTY_CONTENT_POPUPS}
                maxItemWidth="360px"
              />
            }
          />
        }
        hasBorder={true}
      />
    );
  }
}

export default List;
