import {
  FormControl,
  TextInfo,
  ModalTrigger,
  Icon
} from '@erxes/ui/src/components';
import React from 'react';
import Form from '../containers/Form';
import { IAssignmentCampaign } from '../types';
import { Link } from 'react-router-dom';
import { router } from '@erxes/ui/src/utils';

type Props = {
  assignmentCampaign: IAssignmentCampaign;
  history: any;
  isChecked: boolean;
  toggleBulk: (
    assignmentCampaign: IAssignmentCampaign,
    isChecked?: boolean
  ) => void;
};

class Row extends React.Component<Props> {
  modalContent = props => {
    const { assignmentCampaign } = this.props;

    const updatedProps = {
      ...props,
      assignmentCampaign
    };

    return <Form {...updatedProps} history={this.props.history} />;
  };

  removeSegmentParams = () => {
    const { history } = this.props;

    router.removeParams(history, 'segmentIds');
  };

  render() {
    const { assignmentCampaign, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(assignmentCampaign, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const {
      _id,
      title,
      startDate,
      endDate,
      finishDateOfUse,
      status
    } = assignmentCampaign;

    const trigger = (
      <tr key={_id}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{title}</td>
        <td>{new Date(startDate || '').toLocaleDateString()}</td>
        <td>{new Date(endDate || '').toLocaleDateString()}</td>
        <td>{new Date(finishDateOfUse || '').toLocaleDateString()}</td>
        <td>
          <TextInfo>{status}</TextInfo>
        </td>
        <td onClick={onClick}>
          <Link to={`/assignments?campaignId=${_id}`}>
            <Icon icon="list-2" />
          </Link>
        </td>
      </tr>
    );

    return (
      <ModalTrigger
        size={'lg'}
        title="Edit assignment campaign"
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={this.modalContent}
        onExit={this.removeSegmentParams}
      />
    );
  }
}

export default Row;
