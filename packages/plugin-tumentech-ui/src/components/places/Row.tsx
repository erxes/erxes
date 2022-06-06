import React from 'react';
import { RowTitle } from '@erxes/ui-engage/src/styles';
import { IPlace } from '../../types';
import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils/core';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import PlaceForm from '../../containers/places/Form';

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
      <td key={`${place._id}_${place.province}`}>
        <RowTitle>{place.province || '-'}</RowTitle>
      </td>

      <td key={`${place._id}_${place.name}`}>
        <RowTitle>{place.name || '-'}</RowTitle>
      </td>

      <td key={`${place._id}_${place.code}`}>
        <RowTitle>{place.code || '-'} </RowTitle>
      </td>

      <td key={`${place._id}_${place.center.lat}`}>
        <RowTitle>{place.center.lat || 'NA'}</RowTitle>
      </td>

      <td key={`${place._id}_${place.center.lng}`}>
        <RowTitle>{place.center.lng || 'NA'}</RowTitle>
      </td>

      <td key={`${place._id}_${place.center.description}`}>
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
