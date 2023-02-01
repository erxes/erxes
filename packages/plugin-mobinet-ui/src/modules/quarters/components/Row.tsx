import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import QuarterForm from '../containers/Form';

import { IQuarter } from '../types';

type Props = {
  quarter: IQuarter;
  remove: (quarterId: string) => void;
};

const Row = (props: Props) => {
  const { quarter, remove } = props;

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(quarter._id);
    };

    return (
      <Tip text={__('Delete')} placement="top">
        <Button
          id="quarterDelete"
          btnStyle="link"
          onClick={onClick}
          icon="times-circle"
        />
      </Tip>
    );
  };

  const formContent = props => <QuarterForm {...props} quarter={quarter} />;

  const center = quarter.center || {
    lat: 0,
    lng: 0,
    description: 'description'
  };
  // <th>{__('code')}</th>
  // <th>{__('name')}</th>
  // <th>{__('Latitude')}</th>
  // <th>{__('Longitude')}</th>
  // <th>{__('iso')}</th>
  // <th>{__('stat')}</th>

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>{quarter.code || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{quarter.name || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{center.lat || 'NA'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{center.lng || 'NA'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>
          {(quarter.district &&
            quarter.district.city &&
            quarter.district.city.name) ||
            '-'}
        </RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>
          {(quarter.district && quarter.district.name) || '-'}
        </RowTitle>
      </td>

      {/*<td key={Math.random()}>
        <RowTitle>{quarter.stat || '-'}</RowTitle>
      </td> */}

      <td>
        <ActionButtons>
          <ModalTrigger
            title={'Edit quarter'}
            trigger={<Button btnStyle="link" icon="edit-3" />}
            content={formContent}
            size={'lg'}
          />
          {renderRemoveAction()}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
