import React from 'react';
import { ButtonMutate } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import From from '../components/Form';
import { mutations, queries } from '../graphql';
import { AssignmentCampaignQueryResponse, IAssignmentCampaign } from '../types';

type Props = {
  assignmentCampaign?: IAssignmentCampaign;
  history: any;
  queryParams: any;
  closeModal: () => void;
};

type FinalProps = {
  assignmentCampaignsQuery: AssignmentCampaignQueryResponse;
} & Props;

class AssignmentFormContainer extends React.Component<FinalProps> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      const attachmentMoreArray: any[] = [];
      const attachment = values.attachment || undefined;
      const attachmentMore = values.attachmentMore || [];

      attachmentMore.map(att => {
        attachmentMoreArray.push({ ...att, __typename: undefined });
      });

      values.attachment = attachment
        ? { ...attachment, __typename: undefined }
        : null;
      values.attachmentMore = attachmentMoreArray;

      return (
        <ButtonMutate
          mutation={
            object && object._id
              ? mutations.assignmentCampaignsEdit
              : mutations.assignmentCampaignsAdd
          }
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButton
    };

    return <From {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['assignmentCampaigns'];
};

export default AssignmentFormContainer;
