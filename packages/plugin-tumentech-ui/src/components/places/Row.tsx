import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import PlaceForm from '../../containers/places/Form';
import { IPlace } from '../../types';

type Props = {
  place: IPlace;
  remove: (placeId: string) => void;
};

const Row = (props: Props) => {
  const { place, remove } = props;

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(place._id);
    };

    return (
      <Tip text={__('Delete')} placement="top">
        <Button
          id="directionDelete"
          btnStyle="link"
          onClick={onClick}
          icon="times-circle"
        />
      </Tip>
    );
  };

  const formContent = props => <PlaceForm {...props} place={place} />;

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>{place.province || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{place.name || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{place.code || '-'} </RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{place.center.lat || 'NA'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{place.center.lng || 'NA'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{place.center.description || '-'}</RowTitle>
      </td>

      <td>
        <ActionButtons>
          <ModalTrigger
            title={'Edit place'}
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
