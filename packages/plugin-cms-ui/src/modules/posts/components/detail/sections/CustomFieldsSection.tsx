import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import GenerateCustomFields from '@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { FieldsGroupsQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';

type Props = {
  post: any;
  loading?: boolean;
  isDetail: boolean;
  collapseCallback?: () => void;

  clientPortalId: string;

  onChange: (field: string, value: any) => void;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props;

const CustomFieldsSection = (props: FinalProps) => {
  const { post, fieldsGroupsQuery, loading, isDetail, collapseCallback } =
    props;
  const [customFieldsData, setCustomFieldsData] = React.useState<any[]>(
    post.customFieldsData
  );

  if (fieldsGroupsQuery && fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }

  const onValuesChange = (doc: any) => {

    const { data } = doc;

    const keys = Object.keys(data);
    if (!keys || !keys.length) {
      return;
    }

    for (const key of keys) {

      const field = customFieldsData.find((c) => c.field === key);

      const datas: any = customFieldsData
      if (!field) {
        datas.push({
          field: key,
          value: data[key],
        })
      } else {
        const updatedDatas = datas.map((item) =>
          item.field === key ? { ...item, value: data[key] } : item
        );
        return props.onChange('customFieldsData', updatedDatas);
      }

      props.onChange('customFieldsData', datas );
    }
  };

  const updatedProps = {
    loading,
    customFieldsData: post.customFieldsData,
    fieldsGroups: fieldsGroupsQuery ? fieldsGroupsQuery.fieldsGroups : [],
    isDetail,
    object: post,
    collapseCallback,
    onValuesChange,
  };

  return <GenerateCustomFields {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
      gql(fieldQueries.fieldsGroups),
      {
        name: 'fieldsGroupsQuery',
        options: () => ({
          variables: {
            contentType: 'cms:post',
            isDefinedByErxes: false,
          },
        }),
      }
    )
  )(CustomFieldsSection)
);
