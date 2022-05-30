import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { MapContainer, ModalFooter } from '@erxes/ui/src/styles/main';
import {
  IButtonMutateProps,
  IFormProps,
  ILocationOption
} from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';
import { IDirection, IPlace, IRoute } from '../../types';
import { CITIES, ROAD_CONDITIONS } from '../../constants';
import Select from 'react-select-plus';
import Map from '@erxes/ui/src/components/Map';
import { removeTypename } from '@erxes/ui/src/utils';

type Props = {
  route?: IRoute;
  directions: IDirection[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const RouteForm = (props: Props) => {
  const { route } = props;

  const [directionItems, setDirections] = useState(
    (route && route.directionItems) || []
  );
  //   directionId: string;
  //   order: number;
  const onChangeDirection = values => {
    setDirections(
      values.map((option, index) => {
        return { directionId: option.value, order: index };
      })
    );
  };

  const generateDoc = () => {
    const { route } = props;
    const finalValues: any = {};

    if (route) {
      finalValues._id = route._id;
    }

    return {
      ...finalValues
    };
  };

  const generateUserOptions = () => {
    return props.directions.map(e => ({
      label: `${e.placeA.name} - ${e.placeB.name}`,
      value: `${e._id}`
    }));
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    const onChangeLocation = locationOptions => {
      console.log(locationOptions);
    };

    // var arr = props.directions.filter(direction => directionItems.indexOf(item.id) === -1);
    const selectedIds = directionItems.map(e => e.directionId);
    const selectedDirections = props.directions.filter(
      direction => selectedIds.indexOf(direction._id) !== -1
    );

    const locationOptions: ILocationOption[] = [];

    for (const dir of selectedDirections) {
      locationOptions.push(dir.placeA.center);
      locationOptions.push(dir.placeB.center);
    }

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Directions</ControlLabel>
          <Select
            placeholder={__('Select directions')}
            value={directionItems.map(e => e.directionId)}
            onChange={onChangeDirection}
            options={generateUserOptions()}
            multi={true}
            clearable={true}
          />
        </FormGroup>

        {selectedDirections && selectedDirections.length > 0 && (
          <FormGroup>
            <MapContainer>
              <Map
                center={selectedDirections[0].placeA.center}
                googleMapApiKey={
                  localStorage.getItem('GOOGLE_MAP_API_KEY') || ''
                }
                defaultZoom={7}
                locationOptions={[...new Set(locationOptions)]}
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

        {/* <FormGroup>
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
        </FormGroup> */}

        {/* <FormGroup>
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
        </FormGroup> */}

        {/* <FormGroup>
          <ControlLabel>Road Conditions</ControlLabel>
          <Select
            placeholder={__("Select a road type")}
            value={roadConditions}
            onChange={onChangeRoadCondition}
            options={ROAD_CONDITIONS.ALL}
            multi={true}
            clearable={true}
          />
        </FormGroup> */}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'route',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: route
          })}
        </ModalFooter>
      </>
    );
  };
  return <Form renderContent={renderContent} />;
};

export default RouteForm;
