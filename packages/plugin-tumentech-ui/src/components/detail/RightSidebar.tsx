import {
  __,
  Box,
  CompanySection,
  CustomerSection,
  Sidebar
} from '@erxes/ui/src';
import dayjs from 'dayjs';
import React from 'react';

import { List } from '../../styles';
import { ICar } from '../../types';

type Props = {
  car: ICar;
};

export default class RightSidebar extends React.Component<Props> {
  renderPlan(car) {
    if (!car.plan) {
      return null;
    }

    return (
      <li>
        <div>{__('Plan')}: </div>
        <span>{car.plan}</span>
      </li>
    );
  }

  render() {
    const { car } = this.props;

    return (
      <Sidebar>
        <CustomerSection mainType="car" mainTypeId={car._id} />
        <CompanySection mainType="car" mainTypeId={car._id} />

        <Box title={__('Other')} name="showOthers">
          <List>
            <li>
              <div>{__('Created at')}: </div>{' '}
              <span>{dayjs(car.createdAt).format('lll')}</span>
            </li>
            <li>
              <div>{__('Modified at')}: </div>{' '}
              <span>{dayjs(car.modifiedAt).format('lll')}</span>
            </li>
            {this.renderPlan(car)}
          </List>
        </Box>
      </Sidebar>
    );
  }
}
