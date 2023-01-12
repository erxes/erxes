import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import CityForm from '../containers/Form';

import { ICity } from '../types';

type Props = {
  city: ICity;
  remove: (cityId: string) => void;
};

const Row = (props: Props) => {
  const { city, remove } = props;

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(city._id);
    };

    return (
      <Tip text={__('Delete')} placement="top">
        <Button
          id="cityDelete"
          btnStyle="link"
          onClick={onClick}
          icon="times-circle"
        />
      </Tip>
    );
  };

  const formContent = props => <CityForm {...props} city={city} />;

  const center = city.center || { lat: 0, lng: 0 };

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>{city.code || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{city.name || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{center.lat || 'NA'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{center.lng || 'NA'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{city.iso || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{city.stat || '-'}</RowTitle>
      </td>

      <td>
        <ActionButtons>
          <ModalTrigger
            title={'Edit city'}
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
