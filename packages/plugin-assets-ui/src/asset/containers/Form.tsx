import { ButtonMutate, Spinner } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import {
  IAsset,
  IAssetCategoryQeuryResponse,
  IAssetQueryResponse
} from '../../common/types';
import { getRefetchQueries } from '../../common/utils';
import { queries as categoryQueries } from '../category/graphql';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  asset: IAsset;
  queryParams: any;
  closeModal: () => void;
};

type FinalProps = {
  assetCategories: IAssetCategoryQeuryResponse;
  assets: IAssetQueryResponse;
} & Props;

class FormContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  renderButton({
    text,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) {
    const { unitPrice, assetCount, minimiumCount } = values;
    const attachmentMoreArray: any[] = [];
    const attachment = values.attachment || undefined;
    const attachmentMore = values.attachmentMore || [];

    attachmentMore.map(attach => {
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
  }

  render() {
    const { assetCategories, assets } = this.props;

    if (assetCategories.loading || assets.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      ...this.props,
      categories: assetCategories.assetCategories,
      assets: assets.assets,
      renderButton: this.renderButton
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql(gql(categoryQueries.assetCategory), {
      name: 'assetCategories'
    }),
    graphql(gql(queries.assets), {
      name: 'assets'
    })
  )(FormContainer)
);
