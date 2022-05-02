import dayjs from 'dayjs';
import {
  __,
  Box,
  CompanySection,
  CustomerSection,
  Sidebar,
} from '@erxes/ui/src';
import React from 'react';

import { List } from '../../styles';
import { IContract } from '../../types';

type Props = {
  contract: IContract;
};

export default class RightSidebar extends React.Component<Props> {
  renderPlan(contract) {
    if (!contract.plan) {
      return null;
    }

    return (
      <li>
        <div>{__('Plan')}: </div>
        <span>{contract.plan}</span>
      </li>
    );
  }

  render() {
    const { contract } = this.props;

    return (
      <Sidebar>
        <CustomerSection
          mainType="contract"
          mainTypeId={contract._id}
          title={'Primary Customers'}
          name={'Contract'}
        />
        <CustomerSection
          mainType="contractSub"
          mainTypeId={contract._id}
          title={'Collectively Customers'}
          name={'Contract'}
        />
        <CompanySection mainType="contract" mainTypeId={contract._id} />

        <Box title={__('Other')} name="showOthers">
          <List>
            <li>
              <div>{__('Created at')}: </div>{' '}
              <span>{dayjs(contract.createdAt).format('lll')}</span>
            </li>
            {this.renderPlan(contract)}
          </List>
        </Box>
      </Sidebar>
    );
  }
}
