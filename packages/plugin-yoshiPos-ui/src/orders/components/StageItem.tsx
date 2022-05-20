import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IOrderItemInput } from '../types';
import { FlexBetween, FlexCenter } from 'modules/common/styles/main';
import Icon from 'modules/common/components/Icon';
import Quantity from './Quantity';
import { SelectedItem, SelectedStage } from './kiosk/style';
import FormControl from 'modules/common/components/form/Control';
import { ORDER_TYPES } from '../../../constants';
import Tip from 'modules/common/components/Tip';
import { PackageProduct } from '../styles';
import { __ } from 'erxes-ui/lib/utils/core';
import { darken, rgba } from 'modules/common/styles/ecolor';
import colors from 'modules/common/styles/colors';
import { dimensions } from 'modules/common/styles';

const Item = styledTS<{ isTaken?: boolean; color?: string }>(styled.div)`
  background: #fff;
  border: ${props =>
    props.isTaken
      ? `1px solid ${colors.borderDarker}`
      : `1px solid ${rgba(
          props.color ? props.color : colors.colorSecondary,
          0.4
        )}`}; 
  border-radius: 8px;
  position: relative;
  margin-bottom: 10px;
`;

const Close = styledTS<{
  isPortrait?: boolean;
  color?: string;
  isTaken?: boolean;
}>(styled(FlexCenter))`
  background: ${props =>
    props.color
      ? props.isTaken
        ? colors.borderPrimary
        : rgba(props.color, 0.12)
      : props.isTaken
      ? colors.borderPrimary
      : rgba(colors.colorSecondary, 0.12)};
  width: ${props => (props.isPortrait ? '0' : '20px')};
  cursor: pointer;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  transition: all ease 0.3s;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  font-size: 10px
  justify-content: center;
  transition: all ease .3s;

  input {
    width: ${props => (props.isPortrait ? '36px' : '18px;')};
    height: ${props => (props.isPortrait ? '124px' : '18px;')};
  }

  &:hover {
    background: ${props =>
      props.color
        ? rgba(props.color, 0.18)
        : rgba(colors.colorSecondary, 0.18)};
  }
`;

export const ItemInfo = styledTS<{ isPortrait?: boolean }>(styled.div)`
  padding: ${props => (props.isPortrait ? '' : '5px')};
  font-size: ${props => props.isPortrait && '12px'};
  margin-top: ${props => props.isPortrait && ''};
  margin-right: ${dimensions.coreSpacing}px;
  display: ${props => (props.isPortrait ? '' : 'flex')};
  align-items: center;
  justify-content: space-between;
  flex: 1;

  > div {
    display: flex;
    align-items: center;
  }

  input {
    width: ${dimensions.coreSpacing - 5}px;
    height:  ${dimensions.coreSpacing - 5}px;
  }
`;

const ProductName = styledTS<{ isTaken?: boolean; color?: string }>(styled.div)`
  line-height: 15px;
  font-size: 12px;
  margin-left: 5px;
  display: grid;
  color: ${props =>
    props.isTaken
      ? '#616E7C'
      : darken(props.color ? props.color : colors.colorSecondary, 35)};

  > span {
    margin: 5px 0;
    font-size: 11px;
  }

  b {
    word-break: break-word;
  }
`;

export const COUNT_TYPES = {
  MINUS: 'minus',
  PLUS: 'plus'
};

type Props = {
  item: IOrderItemInput;
  color: string;
  orientation?: string;
  changeItemCount: (item: IOrderItemInput) => void;
  changeItemIsTake: (item: IOrderItemInput, value: boolean) => void;
  type: string;
  mode: string;
};

type State = {
  isTake: boolean;
  countType: string;
};

export default class StageItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.onChange = this.onChange.bind(this);

    const { type, item } = this.props;

    this.state = {
      isTake: type === ORDER_TYPES.EAT ? item.isTake || false : true,
      countType: ''
    };
  }

  onChange(e) {
    const { item, changeItemCount } = this.props;

    changeItemCount({ ...item, count: parseInt(e) });
  }

  renderCheckbox() {
    const { item, changeItemIsTake, mode, type } = this.props;

    if (mode === 'kiosk' || type !== ORDER_TYPES.EAT) {
      return <></>;
    }

    const onChange = e => {
      changeItemIsTake(item, e.target.checked);
    };

    return (
      <Tip text={'Тусгайлан авч явах бол тэмдэглэх'} placement="right">
        <label>
          <FormControl
            type="checkbox"
            round={true}
            name="itemIsTake"
            onChange={onChange}
            checked={item.isTake}
            onClick={e => {
              e.stopPropagation();
            }}
          />
        </label>
      </Tip>
    );
  }

  renderName() {
    const { item } = this.props;

    if (item.isPackage) {
      return <PackageProduct>{item.productName}</PackageProduct>;
    }

    return item.productName;
  }

  render() {
    const { item, changeItemCount, color, mode } = this.props;
    const { unitPrice, count, productImgUrl, productName } = item;
    const { countType } = this.state;

    const onRemoveItem = () => {
      changeItemCount({ ...item, count: 0 });
    };

    const onIncCount = value => {
      const count = item.count + 1;

      this.setState({ countType: value });
      changeItemCount({ ...item, count });
    };

    const onDecCount = value => {
      const count = item.count - 1;

      this.setState({ countType: value });
      changeItemCount({ ...item, count });
    };

    if (mode === 'kiosk') {
      return (
        <SelectedItem color={color}>
          <SelectedStage>
            <Icon onClick={onRemoveItem} icon="cancel-1" color={color} />
            <div className="image-wrapper">
              <img
                src={productImgUrl ? productImgUrl : 'images/no-category.jpg'}
                alt={productName}
              />
            </div>
            <div className="text-wrapper">
              <div>
                <b>{this.renderName()}</b>
              </div>
              <span>
                <b>{count}</b> x{' '}
                {Number((unitPrice || 0).toFixed(1)).toLocaleString()}₮
              </span>
            </div>
            <div className="count-wrapper">
              <button
                className={countType === COUNT_TYPES.MINUS ? 'active' : ''}
                onClick={() => onDecCount(COUNT_TYPES.MINUS)}
              >
                <b>{__('-')}</b>
              </button>
              {/* <span>{count}</span> */}
              <button
                className={countType === COUNT_TYPES.PLUS ? 'active' : ''}
                onClick={() => onIncCount(COUNT_TYPES.PLUS)}
              >
                <b>{__('+')}</b>
              </button>
            </div>
          </SelectedStage>
        </SelectedItem>
      );
    }

    return (
      <Item isTaken={item.isTake} color={color}>
        <FlexBetween>
          <ItemInfo>
            <div>
              {this.renderCheckbox()}
              <ProductName color={color} isTaken={item.isTake}>
                <b>{this.renderName()}</b>
                <span>
                  {Number((unitPrice || 0).toFixed(1)).toLocaleString()}₮
                </span>
              </ProductName>
            </div>
            <Quantity
              step={1}
              max={1000}
              value={count || 0}
              onChange={this.onChange}
              color={color}
            />
          </ItemInfo>
          <Close onClick={onRemoveItem} color={color} isTaken={item.isTake}>
            <Icon icon="cancel-1" />
          </Close>
        </FlexBetween>
      </Item>
    );
  } // end render()
}
