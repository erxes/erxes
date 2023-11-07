import React from 'react';
import { IReport } from '../types';
import {
  ActionButtons,
  Button,
  FormControl,
  Icon,
  NameCard,
  Tags,
  Tip
} from '@erxes/ui/src/components';
import { FlexCenter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  report: IReport;
  history: any;
  isChecked: boolean;
  toggleReport: (reportId: string, isChecked?: boolean) => void;
  removeReports: (reportIds: string[]) => void;
};

const Row = (props: Props) => {
  const { report, history, isChecked, toggleReport, removeReports } = props;

  const { updatedBy, createdBy } = report;

  const removeAction = () => {
    const onRemove = () => removeReports([report._id]);

    return (
      <Tip text={__('Delete')} placement="top">
        <Button
          id="dashboardDelete"
          btnStyle="link"
          onClick={onRemove}
          icon="times-circle"
        />
      </Tip>
    );
  };

  const onCheckReport = e => {
    if (toggleReport) {
      toggleReport(report._id, e.target.checked);
    }
  };

  return (
    <tr>
      <td>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onCheckReport}
        />
      </td>

      <td>{report.name}</td>

      <td className="text-primary">
        <Icon icon="swatchbook" /> <b>{report.chartsCount || 0}</b>
      </td>

      <td>
        <FlexCenter>
          <NameCard user={updatedBy} avatarSize={30} />
        </FlexCenter>
      </td>
      <td>
        <FlexCenter>
          <NameCard user={createdBy} avatarSize={30} />
        </FlexCenter>
      </td>

      <td>
        <Icon icon="calendar" />
        <span>
          {report.updatedAt ? report.updatedAt.toLocaleString() : '-'}
        </span>
      </td>
      <td>
        <Icon icon="calendar" />
        <span>
          {report.createdAt ? report.createdAt.toLocaleString() : '-'}
        </span>
      </td>
      <td>
        <Tags tags={report.tags || []} limit={3} />
      </td>

      <td>
        <ActionButtons>{removeAction()}</ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
