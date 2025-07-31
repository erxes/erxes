import { Spinner } from '@erxes/ui/src';

import { gql, useQuery } from '@apollo/client';
import { getReactSelectStyle } from '@erxes/ui/src/components/richTextEditor/RichTextEditorControl/styles';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';
import Select from 'react-select';

type ComponentResponse = ({
  onClick
}: {
  onClick: (placeholder: string) => void;
}) => React.ReactNode;

export const SelectDocument = ({ triggerType }): ComponentResponse => {
  if (!isEnabled('documents')) {
    return () => <></>;
  }

  const query = `query Documents($contentType: String) {
    documents(contentType: $contentType) {
      _id
      name
      code
    }
  }`;
  const [serviceName] = triggerType.includes('core')
    ? triggerType.split('.')
    : triggerType.split(':');

  const { data, loading } = useQuery(gql(query), {
    variables: {
      contentType: serviceName
    }
  });

  return ({ onClick }) => {
    if (loading) {
      return <Spinner objective />;
    }

    return (
      <Select
        placeholder='Documents'
        isMulti={false}
        isSearchable={false}
        menuPlacement='auto'
        maxMenuHeight={200}
        isLoading={loading}
        onChange={(val: any) => onClick(`document.${val.value}`)}
        options={(data?.documents || []).map(({ _id, name }) => ({
          value: _id,
          label: name
        }))}
        menuPortalTarget={document.body}
        styles={getReactSelectStyle(false)}
      />
    );
  };
};
