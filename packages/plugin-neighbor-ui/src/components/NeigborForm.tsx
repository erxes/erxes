import React, { useState } from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import Icon from '@erxes/ui/src/components/Icon';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import { TYPES } from '../constants';
import NeighorFormItem from '../containers/NeighorFormItem';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { ControlLabel } from '@erxes/ui/src/components/form';
import { FlexRow } from '../styles';
import { FlexItem } from '@erxes/ui-settings/src/styles';
import ReactStars from 'react-rating-stars-component';

type Props = {
  neighbor: any;
  productCategoryName: string;
  save: (data: any, rate: any) => void;
};

const NeighborForm = ({ productCategoryName, neighbor, save }: Props) => {
  const [data, setdata] = useState(neighbor ? neighbor.data || {} : {});
  const [rate, setRate] = useState(neighbor ? neighbor.rate || {} : {});
  const onChange = (type, values) => {
    setdata({
      ...data,
      [type]: values
    });
  };

  const onChangeStar = (value, star) => {
    setRate({
      ...rate,
      [value]: star
    });
  };

  const renderTypes = TYPES.map(type => {
    return (
      <NeighorFormItem
        type={type}
        itemData={data[type.type] || []}
        onChange={onChange}
      />
    );
  });

  const renderStar = () => {
    return (
      <>
        <ControlLabel>Орчны үнэлгээ</ControlLabel>
        <br />
        <br />
        <FlexRow>
          <FlexItem>
            <ControlLabel uppercase={false}>Алхах орчин</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ReactStars
              isHalf={true}
              count={5}
              value={rate['Алхах орчин'] ? rate['Алхах орчин'] : 0}
              onChange={e => onChangeStar('Алхах орчин', e)}
              size={25}
              activeColor="#ffd700"
            />
          </FlexItem>
        </FlexRow>
        <FlexRow>
          <FlexItem>
            <ControlLabel uppercase={false}>Тоглоомын талбай</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ReactStars
              isHalf={true}
              count={5}
              value={rate['Тоглоомын талбай'] ? rate['Тоглоомын талбай'] : 0}
              onChange={e => onChangeStar('Тоглоомын талбай', e)}
              size={25}
              activeColor="#ffd700"
            />
          </FlexItem>
        </FlexRow>
        <FlexRow>
          <FlexItem>
            <ControlLabel uppercase={false}>Гадаах авто зогсоол</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ReactStars
              isHalf={true}
              count={5}
              value={
                rate['Гадаах авто зогсоол'] ? rate['Гадаах авто зогсоол'] : 0
              }
              onChange={e => onChangeStar('Гадаах авто зогсоол', e)}
              size={25}
              activeColor="#ffd700"
            />
          </FlexItem>
        </FlexRow>
        <FlexRow>
          <FlexItem>
            <ControlLabel uppercase={false}>Дэлгүүр</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ReactStars
              isHalf={true}
              count={5}
              value={rate['Дэлгүүр'] ? rate['Дэлгүүр'] : 0}
              onChange={e => onChangeStar('Дэлгүүр', e)}
              size={25}
              activeColor="#ffd700"
            />
          </FlexItem>
        </FlexRow>
      </>
    );
  };

  const closeModal = formProps => {
    save(data, rate);
    formProps.closeModal();
  };

  const content = formProps => {
    const cancel = (
      <Button
        btnStyle="simple"
        type="button"
        icon="times-circle"
        uppercase={false}
        onClick={formProps.closeModal}
      >
        Cancel
      </Button>
    );

    return (
      <>
        {renderTypes}
        {renderStar()}
        <ModalFooter>
          {cancel}
          <Button
            onClick={() => closeModal(formProps)}
            btnStyle="success"
            type="button"
            icon="check-circle"
            uppercase={false}
          >
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  const trigger = (
    <Button id="skill-edit-skill" btnStyle="link">
      <Tip text={__('Neighbor')} placement="bottom">
        <Icon icon="home" />
      </Tip>
    </Button>
  );

  return (
    <ActionButtons>
      <ModalTrigger
        title={productCategoryName}
        trigger={trigger}
        content={content}
      />
    </ActionButtons>
  );
};

export default NeighborForm;
