import {
  Button,
  ChooserColumn as Column,
  ChooserColumns as Columns,
  ChooserTitle as Title,
  Icon,
  MainStyleModalFooter as ModalFooter,
} from '@erxes/ui/src';
import { Info, InfoDetail, InfoTitle } from '../../styles';
import React, { useState } from 'react';

import { CAR_DATAS, CAR_INFO } from '../../constants';
import { ICar } from '../../types';

type Props = {
  objects: ICar[];
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  closeModal: () => void;
};

const CarsMerge = (props: Props) => {
  const { objects, save, closeModal } = props;
  const [car1, car2] = objects;

  const [selectedValues, setSelectedValues] = useState<any>({});

  const handleSave = (e) => {
    e.preventDefault();
    const newSelectedValues = { ...selectedValues };
    const { owner, category } = newSelectedValues;

    if (owner) {
      newSelectedValues.ownerId = owner._id;

      delete newSelectedValues.owner;
    }

    if (category) {
      newSelectedValues.categoryId = category._id;

      delete newSelectedValues.category;
    }

    save({
      ids: objects.map((car) => car._id),
      data: { ...newSelectedValues },
      callback: () => {
        closeModal();
      },
    });
  };

  const handleChange = (type, key, value) => () => {
    const newSelectedValues = { ...selectedValues };

    if (type === 'plus-1') {
      newSelectedValues[key] = value;

      if (key === 'links') {
        const links = Object.assign({ ...selectedValues.links }, value);
        newSelectedValues[key] = links;
      }
    } else {
      delete newSelectedValues[key];
    }

    setSelectedValues(newSelectedValues);
  };

  const renderOwner = (data) => {
    return (
      <Info>
        <InfoTitle>Name: </InfoTitle>
        <InfoDetail>{data.details.fullName || data.email}</InfoDetail>
      </Info>
    );
  };

  const renderCategory = (data) => {
    return (
      <Info>
        <InfoTitle>Name: </InfoTitle>
        <InfoDetail>
          {data.code} - {data.name}
        </InfoDetail>
      </Info>
    );
  };

  const renderTitle = (key) => {
    const title = CAR_INFO[key] || CAR_DATAS[key];

    return <InfoTitle>{title}:</InfoTitle>;
  };

  const renderValue = (field, value) => {
    switch (field) {
      case 'owner':
        return renderOwner(value);
      case 'category':
        return renderCategory(value);

      default:
        return <InfoDetail>{value}</InfoDetail>;
    }
  };

  const renderCarProperties = (key, value, icon) => {
    return (
      <li key={key} onClick={handleChange(icon, key, value)}>
        {renderTitle(key)}
        {renderValue(key, value)}

        <Icon icon={icon} />
      </li>
    );
  };

  const renderCar = (car, icon) => {
    const properties = CAR_INFO.ALL.concat(CAR_DATAS.ALL);

    return (
      <React.Fragment>
        <Title>{car.primaryName || car.website}</Title>
        <ul>
          {properties.map((info) => {
            const key = info.field;

            if (!car[key]) {
              return null;
            }

            return renderCarProperties(key, car[key], icon);
          })}
        </ul>
      </React.Fragment>
    );
  };

  return (
    <form onSubmit={handleSave}>
      <Columns>
        <Column className="multiple">{renderCar(car1, 'plus-1')}</Column>

        <Column className="multiple">{renderCar(car2, 'plus-1')}</Column>

        <Column>{renderCar(selectedValues, 'times')}</Column>
      </Columns>

      <ModalFooter>
        <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
          Cancel
        </Button>
        <Button type="submit" btnStyle="success" icon="checked-1">
          Save
        </Button>
      </ModalFooter>
    </form>
  );
};

export default CarsMerge;
