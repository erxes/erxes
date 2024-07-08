import React from 'react';
import { Spinner } from '@erxes/ui/src';
import { IAssetKbArticlesHistoriesQueryResponse } from '../../../common/types';
import { queries } from '../../graphql';
import { gql, useQuery } from '@apollo/client';
import Component from '../../components/detail/KbArticleHistories';

type Props = {
  assetId: string;
};

const KbArticleHistories = ({ assetId }: Props) => {
  const { loading, data } = useQuery<IAssetKbArticlesHistoriesQueryResponse>(
    gql(queries.assetKbArticlesHistories),
    {
      variables: {
        assetId
      }
    }
  );

  if (loading) {
    return <Spinner objective />;
  }

  const histories = data?.assetKbArticlesHistories || [];

  const updatedProps = {
    histories
  };

  return <Component {...updatedProps} />;
};

export default KbArticleHistories;
