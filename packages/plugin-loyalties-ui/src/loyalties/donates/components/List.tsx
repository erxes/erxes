import { __, Alert, confirm, router } from '@erxes/ui/src/utils';
import {
  Button,
  DataWithLoader,
  FormControl,
  ModalTrigger,
  Pagination,
  SortHandler,
  Table
} from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import {
  MainStyleTitle as Title,
  MainStyleCount as Count
} from '@erxes/ui/src/styles/eindex';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';

import DonateForm from '../containers/Form';
import { LoyaltiesTableWrapper } from '../../common/styles';
import { IDonate } from '../types';
import DonateRow from './Row';
import Sidebar from './Sidebar';
import { IDonateCampaign } from '../../../configs/donateCampaign/types';
import { menuLoyalties } from '../../common/constants';

interface IProps extends IRouterProps {
  donates: IDonate[];
  currentCampaign?: IDonateCampaign;
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: IDonate[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeDonates: (doc: { donateIds: string[] }, emptyBulk: () => void) => void;
  history: any;
  queryParams: any;
}

type State = {
  searchValue?: string;
};

class DonatesList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer = undefined;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  onChange = () => {
    const { toggleAll, donates } = this.props;
    toggleAll(donates, 'donates');
  };

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { history } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });
    this.timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue });
    }, 500);
  };

  removeDonates = donates => {
    const donateIds: string[] = [];

    donates.forEach(donate => {
      donateIds.push(donate._id);
    });

    this.props.removeDonates({ donateIds }, this.props.emptyBulk);
  };

  moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  };

  render() {
    const {
      donates,
      history,
      loading,
      toggleBulk,
      bulk,
      isAllSelected,
      totalCount,
      queryParams,
      currentCampaign
    } = this.props;

    const mainContent = (
      <LoyaltiesTableWrapper>
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              <th>
                <SortHandler sortField={'createdAt'} label={__('Created')} />
              </th>
              <th>
                <SortHandler sortField={'ownerType'} label={__('Owner Type')} />
              </th>
              <th>
                <SortHandler sortField={'ownerId'} label={__('Owner')} />
              </th>
              <th>
                <SortHandler
                  sortField={'donateScore'}
                  label={__('Donate Score')}
                />
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="donates">
            {donates.map(donate => (
              <DonateRow
                donate={donate}
                isChecked={bulk.includes(donate)}
                key={donate._id}
                history={history}
                toggleBulk={toggleBulk}
                currentCampaign={currentCampaign}
                queryParams={queryParams}
              />
            ))}
          </tbody>
        </Table>
      </LoyaltiesTableWrapper>
    );

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        Add donate
      </Button>
    );

    const donateForm = props => {
      return <DonateForm {...props} queryParams={queryParams} />;
    };

    const actionBarRight = () => {
      if (bulk.length > 0) {
        const onClick = () =>
          confirm()
            .then(() => {
              this.removeDonates(bulk);
            })
            .catch(error => {
              Alert.error(error.message);
            });

        return (
          <BarItems>
            <Button
              btnStyle="danger"
              size="small"
              icon="cancel-1"
              onClick={onClick}
            >
              Delete
            </Button>
          </BarItems>
        );
      }
      return (
        <BarItems>
          <FormControl
            type="text"
            placeholder={__('Type to search')}
            onChange={this.search}
            value={this.state.searchValue}
            autoFocus={true}
            onFocus={this.moveCursorAtTheEnd}
          />

          <ModalTrigger
            title="New donate"
            trigger={addTrigger}
            autoOpenKey="showDonateModal"
            content={donateForm}
            backDrop="static"
          />
        </BarItems>
      );
    };

    const actionBarLeft = (
      <Title>
        {(currentCampaign && `${currentCampaign.title}`) ||
          'All donate campaigns'}{' '}
      </Title>
    );
    const actionBar = (
      <Wrapper.ActionBar right={actionBarRight()} left={actionBarLeft} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Donates`) + ` (${totalCount})`}
            submenu={menuLoyalties}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        leftSidebar={
          <Sidebar
            loadingMainQuery={loading}
            queryParams={queryParams}
            history={history}
          />
        }
        content={
          <>
            <Count>
              {totalCount} donate{totalCount > 1 && 's'}
            </Count>
            <DataWithLoader
              data={mainContent}
              loading={loading}
              count={donates.length}
              emptyText="Add in your first donate!"
              emptyImage="/images/actions/1.svg"
            />
          </>
        }
      />
    );
  }
}

export default withRouter<IRouterProps>(DonatesList);
