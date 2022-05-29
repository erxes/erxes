import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { MapContainer, ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';
import { IDirection, IPlace } from '../../types';
import { CITIES, ROAD_CONDITIONS } from '../../constants';
import Select from 'react-select-plus';
import Map from '@erxes/ui/src/components/Map';

type Props = {
  direction?: IDirection;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const PropertyGroupForm = (props: Props) => {
  const { direction } = props;

  const [placeA, setPlaceA] = useState<IPlace>(
    (direction && direction.placeA) || ({} as IPlace)
  );
  const [placeB, setPlaceB] = useState<IPlace>(
    (direction && direction.placeB) || ({} as IPlace)
  );
  const [roadConditions, setRoadCondition] = useState<string[]>(
    (direction && direction.roadConditions) || ['asphalt']
  );
  const [duration, setDuration] = useState<number>(
    (direction && direction.duration) || 0
  );
  const [distance, setDistance] = useState<number>(
    (direction && direction.totalDistance) || 0
  );

  const generateDoc = () => {
    const { direction } = props;
    const finalValues: any = {};

    if (direction) {
      finalValues._id = direction._id;
    }

    finalValues.placeA = placeA;
    finalValues.placeB = placeB;
    finalValues.roadConditions = roadConditions;
    finalValues.duration = duration;
    finalValues.totalDistance = distance;

    return {
      ...finalValues
    };
  };

  const generateUserOptions = (cities: any[] = []) => {
    return cities.map(e => ({
      label: `${e.label} - ${e.city_mn}`,
      value: `${e._id}`
    }));
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    const onChangeLocation = locationOptions => {
      console.log(locationOptions);
    };

    const onChangePlaceA = value => {
      const city = CITIES.find(e => e._id === value.value);

      const place: IPlace = {
        code: city._id,
        name: `${city.label} - ${city.city_mn}`,
        center: {
          lat: parseFloat(city.lat),
          lng: parseFloat(city.lng),
          description: city.city_mn
        }
      };
      setPlaceA(place);
    };

    const onChangePlaceB = value => {
      const city = CITIES.find(e => e._id === value.value);

      const place: IPlace = {
        code: city._id,
        name: `${city.label} - ${city.city_mn}`,
        center: {
          lat: parseFloat(city.lat),
          lng: parseFloat(city.lng),
          description: city.city_mn
        }
      };

      setPlaceB(place);
    };

    const onChangeRoadCondition = values => {
      setRoadCondition(values);
    };

    const onChangeInput = e => {
      const { id, value } = e.target;
      switch (id) {
        case 'duration':
          setDuration(parseInt(value, 10));
          break;
        case 'distance':
          setDistance(parseInt(value, 10));
      }
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Place A</ControlLabel>
          <Select
            placeholder={__('Select a place')}
            value={placeA.code || ''}
            onChange={onChangePlaceA}
            options={generateUserOptions(CITIES)}
            multi={false}
            clearable={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Place B</ControlLabel>
          <Select
            placeholder={__('Select a place')}
            value={placeB.code || ''}
            onChange={onChangePlaceB}
            options={generateUserOptions(CITIES)}
            multi={false}
            clearable={true}
          />
        </FormGroup>

        {placeA.code && placeB.code && (
          <FormGroup>
            <ControlLabel htmlFor="locationOptions">Location:</ControlLabel>
            <MapContainer>
              <Map
                center={placeA.center}
                googleMapApiKey={
                  localStorage.getItem('GOOGLE_MAP_API_KEY') || ''
                }
                defaultZoom={7}
                locationOptions={[placeA.center, placeB.center]}
                mapControlOptions={{
                  controlSize: 30,
                  zoomControl: true,
                  mapTypeControl: true,
                  scaleControl: false,
                  streetViewControl: false,
                  rotateControl: false,
                  fullscreenControl: true
                }}
                isPreview={false}
                drawPolyLines={true}
                onChangeLocationOptions={onChangeLocation}
              />
            </MapContainer>
          </FormGroup>
        )}

        <FormGroup>
          <ControlLabel>Distance (km)</ControlLabel>
          <p>distance between A - B, in kilometers</p>
          <FormControl
            {...formProps}
            id="distance"
            name="totalDistance"
            type="number"
            min={1}
            defaultValue={distance}
            onChange={onChangeInput}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Duration (minutes)</ControlLabel>
          <p>average travel time, in minutes</p>
          <FormControl
            {...formProps}
            id="duration"
            name="duration"
            type="number"
            min={1}
            defaultValue={duration}
            onChange={onChangeInput}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Road Conditions</ControlLabel>
          <Select
            placeholder={__('Select a road type')}
            value={roadConditions}
            onChange={onChangeRoadCondition}
            options={ROAD_CONDITIONS.ALL}
            multi={true}
            clearable={true}
          />
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'property group',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: direction
          })}
        </ModalFooter>
      </>
    );
  };
  return <Form renderContent={renderContent} />;
};

export default PropertyGroupForm;
