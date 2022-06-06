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
import { IDirection, IRoute } from '../../types';
import Select from 'react-select-plus';
import Map from '@erxes/ui/src/components/Map';
import SortableList from '@erxes/ui/src/components/SortableList';

type Props = {
  route?: IRoute;
  routes: IRoute[];
  directions: IDirection[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const RouteForm = (props: Props) => {
  const { route, routes } = props;

  const [directionIds, setDirectionIds] = useState<string[]>(
    (route && route.directionIds) || []
  );

  const [directions, setDirections] = useState<IDirection[]>(
    (route && route.directions) || []
  );

  const [routeId, setRouteId] = useState<string>('');

  const [name, setName] = useState<string>((route && route.name) || '');

  const [code, setCode] = useState<string>((route && route.code) || '');

  const onChangeDirection = values => {
    const ids = values.map(option => option.value);

    const selectedDirections = props.directions.filter(
      direction => ids.indexOf(direction._id) !== -1
    );

    setDirections(selectedDirections);

    setDirectionIds(ids);
  };

  const generateDoc = () => {
    const { route } = props;
    const finalValues: any = {};

    if (route) {
      finalValues._id = route._id;
    }

    finalValues.code = code;
    finalValues.directionIds = directionIds;
    finalValues.name = name;

    return {
      ...finalValues
    };
  };

  const generateUserOptions = () => {
    return props.directions.map(e => ({
      label: `${e.places[0].name} - ${e.places[1].name} : ${e.roadCode}`,
      value: `${e._id}`
    }));
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    const locationOptions: ILocationOption[] = [];
    for (const dir of directions) {
      locationOptions.push(dir.places[0].center);
      locationOptions.push(dir.places[1].center);
    }

    const renderOption = (option: IDirection) => {
      const text = `${option.places[0].name}-${option.places[1].name}`;
      return <li key={option._id}>{text}</li>;
    };

    const child = option => renderOption(option);

    return (
      <>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            {...formProps}
            id="name"
            name="name"
            defaultValue={name}
            onChange={e => setName((e.currentTarget as HTMLInputElement).value)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Code</ControlLabel>
          <FormControl
            {...formProps}
            id="code"
            name="code"
            defaultValue={code}
            onChange={e => setCode((e.currentTarget as HTMLInputElement).value)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Existing routes</ControlLabel>
          <Select
            placeholder={__('Select route')}
            value={routeId}
            onChange={option => {
              const selectedRoute = routes.find(r => r._id === option.value);
              if (!selectedRoute) {
                return;
              }
              setRouteId(selectedRoute._id);
              setDirectionIds(selectedRoute.directionIds);

              const selectedDirections = props.directions.filter(
                direction =>
                  selectedRoute.directionIds.indexOf(direction._id) !== -1
              );

              setDirections(selectedDirections);
            }}
            options={routes.map(r => ({
              label: r.name,
              value: r._id
            }))}
            multi={false}
            clearable={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Directions</ControlLabel>
          <Select
            placeholder={__('Select directions')}
            value={directionIds}
            onChange={onChangeDirection}
            options={generateUserOptions()}
            multi={true}
            clearable={true}
          />

          <SortableList
            fields={directions}
            child={child}
            onChangeFields={fields => {
              setDirections(fields);
              setDirectionIds(fields.map(f => f._id));
            }}
            isModal={false}
            showDragHandler={false}
            droppableId="direction options"
          />
        </FormGroup>

        {directions && directions.length > 0 && (
          <FormGroup>
            <MapContainer>
              <Map
                center={directions[0].places[0].center}
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
              />
            </MapContainer>
          </FormGroup>
        )}

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
