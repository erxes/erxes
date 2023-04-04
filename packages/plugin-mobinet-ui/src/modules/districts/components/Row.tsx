import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import DistrictForm from '../containers/Form';

import { IDistrict } from '../types';

type Props = {
  district: IDistrict;
  remove: (districtId: string) => void;
};

const Row = (props: Props) => {
  const { district, remove } = props;

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(district._id);
    };

    return (
      <Tip text={__('Delete')} placement="top">
        <Button
          id="districtDelete"
          btnStyle="link"
          onClick={onClick}
          icon="times-circle"
        />
      </Tip>
    );
  };

  const formContent = props => <DistrictForm {...props} district={district} />;

  const center = district.center || {
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
        <RowTitle>{district.code || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{district.name || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{center.lat || 'NA'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{center.lng || 'NA'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{(district.city && district.city.name) || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{district.isCapital ? 'capital' : 'rural'}</RowTitle>
      </td>

      <td>
        <ActionButtons>
          <ModalTrigger
            title={'Edit district'}
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
