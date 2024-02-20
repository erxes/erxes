import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useEffect, useState } from 'react';
import OSMBuildings from '../../../common/OSMBuildings';
import { ICoordinates } from '../../../types';
import { findCenter, getBuildingColor } from '../../../utils';
import SelectCity from '../../cities/containers/SelectCity';
import { ICity } from '../../cities/types';
import SelectDistrict from '../../districts/containers/SelectDistrict';
import { IDistrict } from '../../districts/types';
import SelectQuarter from '../../quarters/containers/SelectQuarter';
import { IBuilding, IOSMBuilding } from '../types';

type Props = {
  osmBuilding?: IOSMBuilding;
  city?: ICity;
  district?: IDistrict;
  building?: IBuilding;
  suhTagId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const BuildingForm = (props: Props) => {
  const { building } = props;

  const [osmBuilding, setOsmBuilding] = useState(props.osmBuilding);
  const [quarterId, setQuarterId] = useState<string>(
    (building && building.quarterId) || '',
  );
  const [districtId, setDistrictId] = useState<string>(
    (building && building.quarter.districtId) || '',
  );
  const [name, setName] = useState<string>(props.building?.name || '');
  const [cityId, setCityId] = useState<string | undefined>(
    (props.city && props.city._id) ||
      (building &&
        building.quarter &&
        building.quarter.district &&
        building.quarter.district.cityId) ||
      '',
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
      findCenter(generateCoordinates(props.osmBuilding.properties.bounds))) ||
      (building && building.location),
  );

  const [buildingObject, setBuildingObject] = useState<IBuilding | undefined>(
    building,
  );
  // const setBuildingObject = val => {};
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
      setName(osmBuilding.properties.name || '');
      setCenter(findCenter(generateCoordinates(osmBuilding.properties.bounds)));
    }

    if (buildingObject && map) {
      map.highlight((feature) => {
        if (feature.id === buildingObject.osmbId) {
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
      finalValues.name = name;
      // finalValues.code = buildingObject.code;
      finalValues.quarterId = quarterId;
      finalValues.osmbId = osmBuilding && osmBuilding.id;
      finalValues.location =
        osmBuilding &&
        findCenter(generateCoordinates(osmBuilding.properties.bounds));
      finalValues.suhId = buildingObject.suhId;

      finalValues.serviceStatus = buildingObject.serviceStatus;
      finalValues.networkType = buildingObject.networkType;
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
    setTimeout(() => {
      setOsmBuilding(e);
    }, 200);
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
          value={buildingObject && buildingObject.name}
          defaultValue={buildingObject && buildingObject.name}
          onChange={(d) => {
            const { id, value } = d.target as any;

            let obj: any = buildingObject || {};

            obj[id] = value;

            setBuildingObject(obj);
          }}
        />
      </FormGroup>
    );
  };

  const render3dMap = () => {
    if (!districtId && !cityId) {
      return null;
    }

    const selectedValues =
      (osmBuilding && [osmBuilding.id]) || (building && [building?.osmbId]);

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

        {/* {renderInput(
          formProps,
          'Code',
          'code',
          'string',
          buildingObject && buildingObject.code
        )} */}
        {/* {renderInput(
          formProps,
          'Name',
          'name',
          'string',
          buildingObject && buildingObject.name,
        )} */}
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            {...formProps}
            id={'name'}
            name={'name'}
            type={'string'}
            required={true}
            value={name}
            defaultValue={name}
            onChange={(d) => {
              const { id, value } = d.target as any;
              setName(value);
            }}
          />
        </FormGroup>
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
            filterParams={{ tag: props.suhTagId }}
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

        <FormGroup>
          <ControlLabel>Network type</ControlLabel>
          <FormControl
            id={'networkType'}
            defaultValue={building ? building.networkType : 'ftth'}
            componentClass="select"
            name="networkType"
            onChange={onChangeInput}
          >
            {['ftth', 'fttb'].map((p, index) => (
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
