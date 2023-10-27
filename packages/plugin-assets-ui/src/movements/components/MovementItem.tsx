import {
  ContentColumn,
  ItemRow as CommonItemRow,
  ItemText
} from '@erxes/ui-cards/src/deals/styles';
import { FormControl, Icon, TextInfo, __ } from '@erxes/ui/src';
import client from '@erxes/ui/src/apolloClient';
import { Flex } from '@erxes/ui/src/styles/main';
import { renderFullName } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import React from 'react';
import { Link } from 'react-router-dom';
import { IMovementItem } from '../../common/types';
import { SelectWithAssets } from '../../common/utils';
import {
  ContainerBox,
  MovementItemConfigContainer,
  MovementItemInfoContainer,
  RemoveRow
} from '../../style';
import { queries as itemQueries } from '../items/graphql';

type Props = {
  item: IMovementItem;
  children: React.ReactNode;
  changeCurrent: (id: string) => void;
  removeRow: (id: string) => void;
  current: string;
  selectedItems?: string[];
  isChecked: boolean;
  onChangeBulkItems: (id: string) => void;
  handleChangeRowItem: (prevItemId, newItem) => void;
};

class MovementItems extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      item,
      children,
      changeCurrent,
      current,
      removeRow,
      isChecked,
      onChangeBulkItems,
      selectedItems
    } = this.props;

    const {
      assetId,
      assetDetail,
      branch,
      department,
      customer,
      company,
      teamMember,
      sourceLocations
    } = item;

    const onChange = e => {
      onChangeBulkItems(item.assetId);
    };
    const onClick = e => {
      e.stopPropagation();
    };

    const ItemRow = ({
      label,
      children
    }: {
      label: string;
      children: React.ReactNode;
    }) => {
      return (
        <CommonItemRow>
          <ItemText>{__(label)}</ItemText>
          <ContentColumn flex="3">{children}</ContentColumn>
        </CommonItemRow>
      );
    };

    const changeRowItem = assetId => {
      client
        .query({
          query: gql(itemQueries.item),
          fetchPolicy: 'network-only',
          variables: { assetId }
        })
        .then(res => {
          let { assetMovementItem } = res.data;
          this.props.handleChangeRowItem(item.assetId, assetMovementItem);
        });
    };

    const generateInfoText = ({ type, prev, current }) => {
      let prevText;
      let currentText;
      if (['branch', 'department'].includes(type)) {
        return (
          <>
            {prev && `${prev?.title} / `}
            {current?.title}
          </>
        );
      }

      if (type === 'team') {
        prevText = prev?.details?.fullName;
        currentText = current?.details?.fullName;
      }

      if (type === 'companies') {
        prevText = prev?.primaryName;
        currentText = current?.primaryName;
      }

      if (type === 'contacts') {
        prevText = prev ? renderFullName(prev || '') : '';
        currentText = current ? renderFullName(current || '') : '';
      }

      const generateLink = variable => {
        if (type === 'contacts') {
          return `/${type}/details/${variable?._id}`;
        }
        return `/settings/${type}/details/${variable?._id}`;
      };

      return (
        <>
          {prev && (
            <>
              <Link to={generateLink(prev)}>{__(prevText)}</Link>
              <TextInfo>/</TextInfo>
            </>
          )}
          <Link to={generateLink(current)}>{__(currentText)}</Link>
        </>
      );
    };

    return (
      <>
        <tr
          id={assetId}
          className={current === assetId ? 'active' : ''}
          onClick={() => changeCurrent(assetId)}
        >
          <td onClick={onClick}>
            <FormControl
              checked={isChecked}
              componentClass="checkbox"
              onChange={onChange}
              color="#3B85F4"
            />
          </td>
          <td>
            <ContainerBox row>{__(assetDetail?.name || '-')}</ContainerBox>
          </td>
          <td>{__(branch?.title || '-')}</td>
          <td>{__(department?.title || '-')}</td>
          <td>{__((customer && renderFullName(customer)) || '-')}</td>
          <td>{__(company?.primaryName || '-')}</td>
          <td>{__(teamMember?.details?.fullName || '-')}</td>
          <td>
            <RemoveRow>
              <Icon onClick={() => removeRow(assetId)} icon="times-circle" />
            </RemoveRow>
          </td>
        </tr>
        {current === assetId && (
          <tr>
            <td style={{ width: 40 }} />
            <td colSpan={7}>
              <>
                <Flex>
                  <MovementItemInfoContainer>
                    <ItemRow label="Choose Asset:">
                      <SelectWithAssets
                        label="Choose Asset"
                        name="assetId"
                        onSelect={changeRowItem}
                        initialValue={assetId}
                        skip={selectedItems?.filter(item => item !== assetId)}
                        customOption={{ value: '', label: 'Choose Asset' }}
                      />
                    </ItemRow>
                    <ItemRow label="Branch:">
                      {generateInfoText({
                        type: 'branch',
                        prev: sourceLocations?.branch,
                        current: branch
                      })}
                    </ItemRow>
                    <ItemRow label="Department:">
                      {generateInfoText({
                        type: 'department',
                        prev: sourceLocations?.department,
                        current: department
                      })}
                    </ItemRow>
                    <ItemRow label="Customer:">
                      {generateInfoText({
                        type: 'contacts',
                        prev: sourceLocations?.customer,
                        current: customer
                      })}
                    </ItemRow>
                    <ItemRow label="Company:">
                      {generateInfoText({
                        type: 'companies',
                        prev: sourceLocations?.company,
                        current: company
                      })}
                    </ItemRow>
                    <ItemRow label="Team Member:">
                      {generateInfoText({
                        type: 'team',
                        prev: sourceLocations?.teamMember,
                        current: teamMember
                      })}
                    </ItemRow>
                  </MovementItemInfoContainer>
                  <MovementItemConfigContainer>
                    <ContainerBox column>{children}</ContainerBox>
                  </MovementItemConfigContainer>
                </Flex>
              </>
            </td>
          </tr>
        )}
      </>
    );
  }
}

export default MovementItems;
