import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState, useEffect } from 'react';
import SelectCity from '../../cities/containers/SelectCity';
import { ICity } from '../../cities/types';
import SelectDistrict from '../../districts/containers/SelectDistrict';
import { IDistrict } from '../../districts/types';
import SelectQuarter from '../../quarters/containers/SelectQuarter';
import OSMBuildings from '../../../common/OSMBuildings';
import { IBuilding, IOSMBuilding } from '../types';
import { ICoordinates } from '../../../types';
import { findCenter, getBuildingColor } from '../../../utils';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import { getEnv } from '@erxes/ui/src/utils/core';

type Props = {
  osmBuilding?: IOSMBuilding;
  city?: ICity;
  district?: IDistrict;
  building?: IBuilding;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  xp;
  closeModal: () => void;
};

const BuildingForm = (props: Props) => {
  const { building } = props;

  const { SUH_TAG } = getEnv();

  console.log('************', building);

  const [osmBuilding, setOsmBuilding] = useState(props.osmBuilding);
  const [quarterId, setQuarterId] = useState<string>(building && building.quarterId || '');
  const [districtId, setDistrictId] = useState<string>(building && building.quarter.districtId || ''); 
  const [cityId, setCityId] = useState<string | undefined>(
    (props.city && props.city._id) ||
      (building &&
        building.quarter &&
        building.quarter.district &&
        building.quarter.district.cityId) ||
      ''
  );

  const [map, setMap] = useState<any>(null);

  const generateCoordinates = (data) => {
    const { min, max } = data;

    return [
      {
        lat: min[1],
        lng: min[0],
      },
      {
        lat: max[1],
        lng: max[0],
      },
    ];
  };

  const [center, setCenter] = useState<ICoordinates>(
    (props.osmBuilding &&
      findCenter(generateCoordinates(props.osmBuilding.properties.bounds))) || (building && building.location)
  );

  const [buildingObject, setBuildingObject] = useState<IBuilding | undefined>(
    building
  );

  useEffect(() => {
    if (props.city && !cityId) {
      setCityId(props.city._id);
    }

    if (props.district && !districtId) {
      setDistrictId(props.district._id);
      setCenter(props.district.center);
    }

    if (osmBuilding) {
      const obj: any = buildingObject || {};

      obj.osmbId = osmBuilding.id;
      obj.code = osmBuilding.id;
      obj.name = osmBuilding.properties.name;

      setBuildingObject(obj);

      setCenter(findCenter(generateCoordinates(osmBuilding.properties.bounds)));
    }

    if (buildingObject && map) {
      console.log('highlight', buildingObject);

      map.highlight((feature) => {
        if (feature.id === buildingObject.osmbId) {
          console.log('highlight', buildingObject.serviceStatus);
          return getBuildingColor(buildingObject.serviceStatus);
        }
      });
    }
  }, [
    props.city,
    cityId,
    props.district,
    districtId,
    osmBuilding,
    buildingObject,
    map,
  ]);

  const generateDoc = () => {
    const finalValues: any = {};

    if (building) {
      finalValues._id = building._id;
    }

    if (buildingObject) {
      finalValues.name = buildingObject.name;
      finalValues.code = buildingObject.code;
      finalValues.quarterId = quarterId;
      finalValues.osmbId = osmBuilding && osmBuilding.id;
      finalValues.location =
        osmBuilding &&
        findCenter(generateCoordinates(osmBuilding.properties.bounds));
      finalValues.suhId = buildingObject.suhId;

      finalValues.serviceStatus = buildingObject.serviceStatus;
    }

    return {
      ...finalValues,
    };
  };

  const onChangeInput = (e) => {
    const { id, value } = e.target;
    const obj: any = buildingObject || {};

    obj[id] = value;

    setBuildingObject(obj);
  };

  const onChangeCenter = (center: ICoordinates, bounds: ICoordinates[]) => {
    setCenter(center);
  };

  const onChangeDistrict = (districtId, center?: ICoordinates) => {
    setDistrictId(districtId);

    if (center) {
      setCenter(center);

      if (map) {
        map.setPosition({ latitude: center.lat, longitude: center.lng });
      }
    }
  };

  const onChangeCity = (cityId, center?: ICoordinates) => {
    setCityId(cityId);

    if (center) {
      setCenter(center);

      if (map) {
        map.setPosition({ latitude: center.lat, longitude: center.lng });
      }
    }
  };

  const onChangeBuilding = (e) => {
    if (e.properties) {
      const obj: any = buildingObject || {};

      obj.name = e.properties.name || '';
      obj.osmbId = e.id;

      setBuildingObject(obj);
    }

    setOsmBuilding(e);
  };

  const renderInput = (formProps, title, name, type, value) => {
    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        <FormControl
          {...formProps}
          id={name}
          name={name}
          type={type}
          required={true}
          value={value}
          defaultValue={value}
          onChange={onChangeInput}
        />
      </FormGroup>
    );
  };

  const render3dMap = () => {
    if (!districtId && !cityId) {
      return null;
    }

    const selectedValues = osmBuilding && [osmBuilding.id] || (building && [building?.osmbId]);

    console.log('selectedValues', selectedValues);

    const onload = (_bounds, mapRef) => {
      setMap(mapRef.current);
    };

    const mapProps = {
      id: 'mapOnForm',
      onChange: onChangeBuilding,
      onChangeCenter,
      center,
      style: { height: '300px', width: '100%' },
      selectedValues,
      onload,
    };

    return <OSMBuildings {...mapProps} />;
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    return (
      <>
        <SelectCity defaultValue={cityId} onChange={onChangeCity} />

        {cityId && (
          <SelectDistrict
            cityId={cityId}
            defaultValue={districtId}
            onChange={onChangeDistrict}
          />
        )}

        {districtId && (
          <SelectQuarter
            districtId={districtId}
            defaultValue={quarterId}
            onChange={(e) => {
              setQuarterId(e);
            }}
          />
        )}

        {renderInput(
          formProps,
          'Code',
          'code',
          'string',
          buildingObject && buildingObject.code
        )}
        {renderInput(
          formProps,
          'Name',
          'name',
          'string',
          buildingObject && buildingObject.name
        )}

        <FormGroup>
          <ControlLabel>СӨХ</ControlLabel>
          <SelectCompanies
            label="СӨХ"
            name="suhId"
            initialValue={building && building.suhId}
            onSelect={(e) => {
              const obj: any = buildingObject || {};
              obj.suhId = e;

              setBuildingObject(obj);
            }}
            multi={false}
            filterParams={{ tag: 'HovpPzg2bfxCoNc4F' }}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Service status</ControlLabel>
          <FormControl
            id={'serviceStatus'}
            defaultValue={building ? building.serviceStatus : 'inactive'}
            componentClass="select"
            name="serviceStatus"
            onChange={onChangeInput}
          >
            {['inactive', 'active', 'inprogress'].map((p, index) => (
              <option key={index} value={p}>
                {p}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        {render3dMap()}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'buildings',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: building,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default BuildingForm;
