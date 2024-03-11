import { gql } from '@apollo/client';
import client from '@erxes/ui/src/apolloClient';
import WithPermission from 'coreui/withPermission';
import React, { useState } from 'react';
import { renderFullName } from '@erxes/ui/src/utils';
import { FormControl, FormGroup } from '@erxes/ui/src/components';

import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import { colors } from '@erxes/ui/src/styles';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import { __, getEnv } from '@erxes/ui/src/utils';
import Dropdown from 'react-bootstrap/Dropdown';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { useLazyQuery, useQuery } from '@apollo/client';
import queries from './graphql';

export const ActionItem = styled.button`
  width: 100%;
  text-align: left;
  min-width: 150px;
  background: none;
  outline: 0;
  border: 0;
  overflow: hidden;

  > i {
    color: ${colors.colorCoreGreen};
    float: right;
  }
`;

export const ActionButton = styledTS<{ color?: string }>(styled.div)`
  height: 25px;
  border-radius: 2px;
  font-weight: 500;
  line-height: 25px;
  font-size: 12px;
  background-color: ${(props) => rgba(props.color || colors.colorPrimary, 0.1)};
  color: ${(props) => props.color || colors.colorPrimaryDark};
  padding: 0 10px;
  transition: background 0.3s ease;
  > i {
    margin-right: 5px;
  }
  > span {
    margin-right: 5px;
  }
  &:hover {
    cursor: pointer;
    background-color: ${(props) =>
      rgba(props.color || colors.colorPrimary, 0.2)};
  }
`;

const DOCUMENTS_QUERY = gql`
  query documents(
    $page: Int
    $perPage: Int
    $contentType: String
    $subType: String
  ) {
    documents(
      page: $page
      perPage: $perPage
      contentType: $contentType
      subType: $subType
    ) {
      _id
      contentType
      name
      createdAt
    }
  }
`;

const ITEM_QUERY = gql`
  query InsuranceItemByDealId($id: String!) {
    insuranceItemByDealId(_id: $id) {
      _id
      companyId
      customFieldsData
      customerId
      dealId
      feePercent
      price
      productId
      totalFee
      userId
      vendorUserId
    }
  }
`;

type Props = {
  item: any;
  contentType: string;
  subType: string;
  path?: string;
};

type State = {
  documents: any[];
  loading: boolean;
};

const PrintActionButton = (props) => {
  const [loading, setLoading] = useState(false);
  const [categoryCode, setCategoryCode] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [docId, setDocId] = useState('');

  const queryResponse = useQuery(DOCUMENTS_QUERY, {
    variables: { contentType: 'insurance' },
  });

  const { data } = useQuery(ITEM_QUERY, {
    variables: { id: props.item._id },
    skip: !props.item,
  });

  const customersQuery = useQuery(queries.customersQuery, {
    variables: {
      mainType: 'deal',
      mainTypeId: props.item._id,
      relType: 'customer',
      isSaved: true,
    },
  });

  const documents = queryResponse.data?.documents || [];
  const insuranceItem = data?.insuranceItemByDealId;

  if (!insuranceItem) {
    return null;
  }

  const customers = customersQuery.data?.customers || [];

  const print = (_id) => {
    const { item, path } = props;

    const url = `${
      getEnv().REACT_APP_API_URL
    }/pl:documents/print?_id=${_id}&itemId=${insuranceItem._id}&${path}`;

    if (customerId) {
      // append customer id to url
      window.open(`${url}&customerId=${customerId}`);
      return;
    }

    window.open(url);
  };

  if (props.item.stage?.type !== 'deal') {
    return null;
  }

  const trigger = (
    <ActionButton>
      {loading ? 'loading' : __('Insurance contract')}
    </ActionButton>
  );

  const renderCustomerSelect = () => {
    return (
      <div style={{ padding: '10px 20px' }}>
        <FormGroup>
          <FormControl
            componentClass="select"
            value={customerId}
            onChange={(e: any) => setCustomerId(e.target.value)}
          >
            <option value="">{__('Customer')}</option>

            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {renderFullName(customer)}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      </div>
    );
  };

  const renderDocumentSelect = () => {
    return (
      <div style={{ padding: '10px 20px' }}>
        <FormGroup>
          <FormControl
            componentClass="select"
            value={categoryCode}
            onChange={(e: any) => {
              print(e.target.value);
            }}
          >
            <option value="">{__('Document')}</option>

            {documents.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      </div>
    );
  };

  return (
    <WithPermission action="manageDocuments">
      <Dropdown>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-select">
          {trigger}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {renderCustomerSelect()}
          {renderDocumentSelect()}

          {/* {documents.map((item) => (
            <li key={item._id}>
              <ActionItem onClick={() => print(item._id)}>
                {item.name}
              </ActionItem>
            </li>
          ))} */}
        </Dropdown.Menu>
      </Dropdown>
    </WithPermission>
  );
};

export default PrintActionButton;
