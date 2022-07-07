import Button from '@erxes/ui/src/components/Button';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';
import { IDealPlace, IPlace } from '../../types';
import Select from 'react-select-plus';
import Map from '@erxes/ui/src/containers/map/Map';

type Props = {
  dealId: string;
  dealPlace?: IDealPlace;
  places: IPlace[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const DirectionForm = (props: Props) => {
  const { dealPlace, places } = props;

  const [startPlaceId, setStartPlaceId] = useState<string | undefined>(
    dealPlace && dealPlace.startPlaceId
  );
  const [endPlaceId, setEndPlaceId] = useState<string | undefined>(
    dealPlace && dealPlace.endPlaceId
  );

  const [startPlace, setStartPlace] = useState<IPlace | undefined>(
    dealPlace && dealPlace.startPlace
  );
  const [endPlace, setEndPlace] = useState<IPlace | undefined>(
    dealPlace && dealPlace.endPlace
  );

  const onChangeStartPlace = option => {
    const place = places.find(e => e._id === option.value);
    place && setStartPlaceId(place._id);
    setStartPlace(place);
  };

  const onChangeEndPlace = option => {
    const place = places.find(e => e._id === option.value);
    place && setEndPlaceId(place._id);
    setEndPlace(place);
  };

  const generateDoc = () => {
    const finalValues: any = {};
    finalValues.dealId = props.dealId;
    finalValues.startPlaceId = startPlaceId;
    finalValues.endPlaceId = endPlaceId;

    return {
      ...finalValues
    };
  };

  const generateUserOptions = () => {
    return props.places.map(e => ({
      label: `${e.province}: ${e.name}`,
      value: `${e._id}`
    }));
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Start</ControlLabel>
          <Select
            placeholder={__('Select a place')}
            value={startPlaceId}
            onChange={onChangeStartPlace}
            options={generateUserOptions()}
            multi={false}
            clearable={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>End</ControlLabel>
          <Select
            placeholder={__('Select a place')}
            value={endPlaceId}
            onChange={onChangeEndPlace}
            options={generateUserOptions()}
            multi={false}
            clearable={true}
          />
        </FormGroup>

        {startPlace && startPlace._id && endPlace && endPlace._id && (
          <FormGroup>
            <Map
              id={Math.random().toString(10)}
              center={startPlace.center}
              zoom={7}
              locationOptions={[startPlace.center, endPlace.center]}
              streetViewControl={false}
              connectWithLines={true}
            />
          </FormGroup>
        )}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'Deal place',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: dealPlace
          })}
        </ModalFooter>
      </>
    );
  };
  return <Form renderContent={renderContent} />;
};

export default DirectionForm;
