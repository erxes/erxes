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
  title: string;
  list: ISegment[] | any;
  listCount: any;
  changeList: any;
  id: string;
};

class Common extends React.Component<Props> {
  render() {
    const {
      content,
      customers,
      onChange,
      checked,
      name,
      title,
      onChangeToggle,
      list,
      changeList,
      listCount,
      id
    } = this.props;

    const customerCounts = counts(customers);

    const actionSelector = (
      <RadioContainer>
        <FormControl
          componentClass="radio"
          onChange={onChange}
          name={name}
          value={false}
          checked={checked === false}
        >
          {__(`Choose a ${title}`)}
        </FormControl>

        <FormControl
          componentClass="radio"
          onChange={onChangeToggle}
          name={name}
          checked={checked === true}
          value={true}
        >
          {__(`Create a ${title}`)}
        </FormControl>
      </RadioContainer>
    );

    const listContent = checked ? null : (
      <ListContainer>
        <List
          list={list}
          changeList={changeList}
          counts={listCount}
          defaultValue={id}
        />
      </ListContainer>
    );

    return content({ actionSelector, customerCounts, listContent });
  }
}

function counts(customers: number): React.ReactNode {
  return (
    <CustomerCounts>
      <Icon icon="users" size={50} />
      <p>
        {customers} {__('customers')}
      </p>
    </CustomerCounts>
  );
}

export default Common;
