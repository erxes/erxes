import { FormControl, TextInfo, Icon } from '@erxes/ui/src/components';
import React from 'react';
import { IAssignmentCampaign } from '../types';
import { Link } from 'react-router-dom';
import * as routerUtils from '@erxes/ui/src/utils/router';

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
      status,
      segmentIds
    } = assignmentCampaign;

    const onTrClick = (e: MouseEvent) => {
      e.preventDefault();

      const { history } = this.props;
      history.push(
        `/erxes-plugin-loyalty/settings/assignment/edit?campaignId=${_id}`
      );

      if (segmentIds) {
        routerUtils.setParams(history, {
          segmentIds: JSON.stringify(segmentIds)
        });
      }
    };

    return (
      <tr key={_id} onClick={onTrClick}>
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
  }
}

export default Row;
