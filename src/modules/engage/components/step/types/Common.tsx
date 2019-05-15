import { FormControl, Icon } from 'modules/common/components';
import { colors, dimensions } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import { ISegment } from 'modules/segments/types';
import * as React from 'react';
import styled from 'styled-components';
import { List } from '../..';

const ListContainer = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

const RadioContainer = styled.div`
  border-bottom: 1px dotted ${colors.borderPrimary};

  > * {
    padding: ${dimensions.coreSpacing}px;
  }
`;

const CustomerCounts = styled.div`
  text-align: center;

  > i {
    color: ${colors.colorCoreLightGray};
  }
`;

type Props = {
  content: any;
  customers: number;
  onChange: any;
  onChangeToggle: any;
  checked: boolean;
  name: string;
  type: string;
  list: ISegment[] | any;
  listCount: any;
  changeList: any;
  id: string;
};

function counts(customers: number) {
  return (
    <CustomerCounts>
      <Icon icon="users" size={50} />
      <p>
        {customers} {__('customers')}
      </p>
    </CustomerCounts>
  );
}

const Common = (props: Props) => {
  const renderRadioControl = ({ label, ...args }) => {
    return (
      <FormControl {...args} componentClass="radio" name={props.name}>
        {label}
      </FormControl>
    );
  };

  const {
    content,
    onChange,
    checked,
    type,
    onChangeToggle,
    list,
    customers,
    changeList,
    listCount,
    id
  } = props;

  const actionSelector = (
    <RadioContainer>
      {renderRadioControl({
        onChange,
        value: false,
        checked: checked === false,
        label: __(`Choose a ${type}`)
      })}

      {renderRadioControl({
        onChange: onChangeToggle,
        value: true,
        checked: checked === true,
        label: __(`Create a ${type}`)
      })}
    </RadioContainer>
  );

  const listContent = checked ? null : (
    <ListContainer>
      <List
        list={list}
        type={type}
        changeList={changeList}
        counts={listCount}
        defaultValue={id}
      />
    </ListContainer>
  );

  return content({
    actionSelector,
    listContent,
    customerCounts: counts(customers)
  });
};

export default Common;
