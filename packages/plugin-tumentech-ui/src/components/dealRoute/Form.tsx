import Button from '@erxes/ui/src/components/Button';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Map from '@erxes/ui/src/containers/map/Map';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import {
  IButtonMutateProps,
  IFormProps,
  ILocationOption
} from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';
import Select from 'react-select-plus';

import { IDealRoute, IRoute } from '../../types';

type Props = {
  dealId: string;
  dealRoute?: IDealRoute;
  routes: IRoute[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  onSearch?: (value: string) => void;
};

const DirectionForm = (props: Props) => {
  let timer: NodeJS.Timer | undefined = undefined;

  const { dealRoute, routes } = props;

  const [route, setRoute] = useState<IRoute | undefined>(
    dealRoute && dealRoute.route
  );

  const onChangeRoute = option => {
    const route = routes.find(e => e._id === option.value);
    route && setRoute(route);
  };

  const onInputChange = value => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      props.onSearch && props.onSearch(value);
    }, 500);
  };

  const generateDoc = () => {
    const finalValues: any = {};
    finalValues.dealId = props.dealId;
    finalValues.routeId = route && route._id;

    return {
      ...finalValues
    };
  };

  const generateUserOptions = () => {
    return props.routes.map(e => ({
      label: `${e.name}`,
      value: `${e._id}`,
      clearableValue: true
    }));
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    const directions = (route && route.directions) || [];

    const locationOptions: ILocationOption[] = [];
    for (const dir of directions) {
      locationOptions.push(dir.places[0].center);
      locationOptions.push(dir.places[1].center);
    }

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Route</ControlLabel>
          <Select
            placeholder={__('Select a route')}
            value={route && route._id}
            onChange={onChangeRoute}
            onInputChange={onInputChange}
            options={generateUserOptions()}
            multi={false}
            clearable={true}
          />
        </FormGroup>

        {directions && directions.length > 0 && (
          <FormGroup>
            <Map
              id={Math.random().toString(10)}
              center={directions[0].places[0].center}
              zoom={7}
              locationOptions={[...new Set(locationOptions)]}
              streetViewControl={false}
              connectWithLines={true}
              googleMapPath={directions.map(
                dir => (dir.googleMapPath && dir.googleMapPath) || ''
              )}
            />
          </FormGroup>
        )}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'Deal route',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: dealRoute
          })}
        </ModalFooter>
      </>
    );
  };
  return <Form renderContent={renderContent} />;
};

export default DirectionForm;
