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
import { ROAD_CONDITIONS } from '../../constants';
import Select from 'react-select-plus';
import Map from '@erxes/ui/src/components/Map';

type Props = {
  direction?: IDirection;
  places: IPlace[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const DirectionForm = (props: Props) => {
  const { direction, places } = props;

  const [placeIds, setPlaceIds] = useState<[string, string]>(
    (direction && direction.placeIds) || ['', '']
  );

  const [placeA, setPlaceA] = useState<IPlace | undefined>(
    direction && direction.places[0]
  );
  const [placeB, setPlaceB] = useState<IPlace | undefined>(
    direction && direction.places[1]
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

  const [routeCode, setRouteCode] = useState<string>(
    (direction && direction.routeCode) || ''
  );

  const [roadCode, setRoadCode] = useState<string>(
    (direction && direction.roadCode) || ''
  );

  const onChangePlaceA = option => {
    placeIds[0] = option.value;

    setPlaceA(places.find(e => e._id === option.value));
    setPlaceIds([...placeIds]);
  };

  const onChangePlaceB = option => {
    placeIds[1] = option.value;

    setPlaceB(places.find(e => e._id === option.value));
    setPlaceIds([...placeIds]);
  };

  const generateDoc = () => {
    const { direction } = props;
    const finalValues: any = {};

    if (direction) {
      finalValues._id = direction._id;
    }

    finalValues.placeIds = placeIds;
    finalValues.roadConditions = roadConditions;
    finalValues.duration = duration;
    finalValues.totalDistance = distance;
    finalValues.roadCode = roadCode;
    finalValues.routeCode = routeCode;

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

    const onChangeRoadCondition = values => {
      setRoadCondition(values.map(e => e.value));
    };

    const onChangeInput = e => {
      const { id, value } = e.target;
      switch (id) {
        case 'duration':
          setDuration(parseInt(value, 10));
          break;
        case 'distance':
          setDistance(parseInt(value, 10));
          break;
        case 'routeCode':
          setRouteCode(value);
          break;
        case 'roadCode':
          setRoadCode(value);
          break;
      }
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Place A</ControlLabel>
          <Select
            placeholder={__('Select a place')}
            value={placeIds[0]}
            onChange={onChangePlaceA}
            options={generateUserOptions()}
            multi={false}
            clearable={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Place B</ControlLabel>
          <Select
            placeholder={__('Select a place')}
            value={placeIds[1]}
            onChange={onChangePlaceB}
            options={generateUserOptions()}
            multi={false}
            clearable={true}
          />
        </FormGroup>

        {placeA && placeA._id && placeB && placeB._id && (
          <FormGroup>
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
              />
            </MapContainer>
          </FormGroup>
        )}

        <FormGroup>
          <ControlLabel>Route code</ControlLabel>
          {/* <p>average travel time, in minutes</p> */}
          <FormControl
            {...formProps}
            id="routeCode"
            name="routeCode"
            defaultValue={routeCode}
            onChange={onChangeInput}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Road code</ControlLabel>
          {/* <p>average travel time, in minutes</p> */}
          <FormControl
            {...formProps}
            id="roadCode"
            name="roadCode"
            defaultValue={roadCode}
            onChange={onChangeInput}
          />
        </FormGroup>

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

export default DirectionForm;
