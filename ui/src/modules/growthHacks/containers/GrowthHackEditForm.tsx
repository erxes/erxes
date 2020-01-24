import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from 'modules/auth/types';
import { IOptions } from 'modules/boards/types';
import { Alert, withProps } from 'modules/common/utils';
import { mutations } from 'modules/forms/graphql';
import {
  IFormSubmission,
  IFormSubmissionParams,
  SaveFormSubmissionMutation
} from 'modules/forms/types';
import React from 'react';
import { graphql } from 'react-apollo';
import GrowthHackEditForm from '../components/GrowthHackEditForm';
import { IGrowthHack, IGrowthHackParams } from '../types';

type Props = {
  options: IOptions;
  item: IGrowthHack;
  users: IUser[];
  addItem: (doc: IGrowthHackParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: IGrowthHackParams, callback?: (item) => void) => void;
  copyItem: (itemId: string, callback: () => void) => void;
  onUpdate: (item, prevStageId?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
};

type FinalProps = {
  saveFormSubmissionMutation: SaveFormSubmissionMutation;
} & Props;

class GrowthHackEditFormContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.saveFormSubmission = this.saveFormSubmission.bind(this);
  }

  saveFormSubmission = ({
    formId,
    formSubmissions,
    contentTypeId
  }: IFormSubmission) => {
    const { saveFormSubmissionMutation } = this.props;

    saveFormSubmissionMutation({
      variables: {
        formId,
        formSubmissions,
        contentTypeId,
        contentType: 'growthHack'
      }
    })
      .then(() => {
        Alert.success('You successfully updated');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  render() {
    const extendedProps = {
      ...this.props,
      saveFormSubmission: this.saveFormSubmission
    };

    return <GrowthHackEditForm {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, SaveFormSubmissionMutation, IFormSubmissionParams>(
      gql(mutations.formSubmissionsSave),
      {
        name: 'saveFormSubmissionMutation'
      }
    )
  )(GrowthHackEditFormContainer)
);
