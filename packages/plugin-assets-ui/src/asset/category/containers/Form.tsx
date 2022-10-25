import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import { IAssetCategoryTypes } from '../../../common/types';
import Form from '../components/Form';
import { mutations } from '../graphql';

type Props = {
  closeModal: () => void;
  refetchAssetCategories: () => void;
  category: IAssetCategoryTypes;
  categories: IAssetCategoryTypes[];
};

type FinalProps = {} & Props;

class FormContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  renderButton = ({
    text,
    values,
    isSubmitted,
    callback,
    confirmationUpdate,
    object
  }: IButtonMutateProps) => {
    let mutation = mutations.assetCategoryAdd;

    let sucessAction = 'added';

    if (object) {
      mutation = mutations.assetCategoryEdit;
      sucessAction = 'updated';
    }

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={callback}
        refetchQueries={['assetCategories', 'assetCategoriesTotalCount']}
        isSubmitted={isSubmitted}
        type="submit"
        confirmationUpdate={confirmationUpdate}
        successMessage={`You successfully ${sucessAction} a ${text}`}
      />
    );
  };

  render() {
    const { closeModal, category, categories } = this.props;

    const updatedProps = {
      renderButton: this.renderButton,
      closeModal,
      category,
      categories
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<Props>(compose()(FormContainer));
