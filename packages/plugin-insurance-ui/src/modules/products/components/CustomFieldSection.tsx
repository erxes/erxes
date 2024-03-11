import { gql, useMutation, useQuery } from '@apollo/client';
import GenerateCustomFields from '@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { isEnabled } from '@erxes/ui/src/utils/core';

import React from 'react';

import { mutations, queries } from '../graphql';

type Props = {
  isDetail: boolean;
  _id?: string;
  product?: any;
  refetch: () => void;
  categoryCode?: string;
  onChange?: (data: any) => void;
};

const CustomFieldsSection = (props: Props) => {
  const { isDetail, _id } = props;

  const fieldsGroupsQuery = useQuery(gql(fieldQueries.fieldsGroups), {
    variables: {
      contentType: 'insurance:product',
      isDefinedByErxes: false,
    },
    skip: !isEnabled('forms') ? true : false,
  });

  // const productDetailQuery = useQuery(queries.GET_PRODUCT, {
  //   variables: {
  //     _id
  //   }
  // });

  const [editMutation] = useMutation(mutations.PRODUCTS_EDIT);

  if (fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }
  const save = (data, callback) => {
    editMutation({
      variables: { _id, ...data },
    })
      .then(() => {
        // productDetailQuery.refetch();
        props.refetch();
        callback();
      })
      .catch((e) => {
        callback(e);
      });
  };

  // const { customFieldsData = [] } = props.product || {};
  let customFieldsData = props.product?.customFieldsData || [];

  let fieldsGroups = fieldsGroupsQuery.data.fieldsGroups || [];

  const codeMap = {
    1: 'vehicle',
    2: 'citizen',
  };

  const categoryCode = props.categoryCode;

  if (categoryCode) {
    fieldsGroups = fieldsGroups.filter(
      (group) => group.code === codeMap[categoryCode] || group.parentId,
    );
  }

  const onValuesChange = (data) => {
    if (props.onChange) {
      props.onChange(data);
    }
  };

  const updatedProps = {
    save,
    customFieldsData,
    fieldsGroups,
    isDetail,
    object: props.product,
    // onValuesChange,
  };

  return <GenerateCustomFields {...updatedProps} />;
};

export default CustomFieldsSection;
