import React from 'react';
import {
  IAsset,
  IAssetCategoryQeuryResponse,
  IAssetQueryResponse,
} from '../../common/types';
import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { getRefetchQueries } from '../../common/utils';
import { gql, useQuery } from '@apollo/client';
import AssetForm from '../components/AssetForm';
import { queries, mutations } from '../graphql';

type Props = {
  asset: IAsset;
  queryParams: any;
  closeModal: () => void;
};

const AssetFormContainer = (props: Props) => {
  const assetsQuery = useQuery<IAssetQueryResponse>(gql(queries.assets));
  const assetCategoriesQuery = useQuery<IAssetCategoryQeuryResponse>(
    gql(queries.assetCategory),
  );

  const renderButton = ({
    text,
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    const { unitPrice, assetCount, minimiumCount } = values;
    const attachmentMoreArray: any[] = [];
    const attachment = values.attachment || undefined;
    const attachmentMore = values.attachmentMore || [];

    attachmentMore.map((attach) => {
      attachmentMoreArray.push({ ...attach, __typename: undefined });
    });

    values.unitPrice = Number(unitPrice);
    values.assetCount = Number(assetCount);
    values.minimiumCount = Number(minimiumCount);
    values.attachment = attachment
      ? { ...attachment, __typename: undefined }
      : null;
    values.attachmentMore = attachmentMoreArray;

    return (
      <ButtonMutate
        mutation={object ? mutations.assetEdit : mutations.assetAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${text}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    categories: assetCategoriesQuery?.data?.assetCategories || [],
    assets: assetsQuery?.data?.assets || [],
    renderButton,
    loading: assetCategoriesQuery.loading || assetsQuery.loading,
  };

  return <AssetForm {...updatedProps} />;
};

export default AssetFormContainer;
