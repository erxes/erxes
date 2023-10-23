import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from './Form';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IReports, IType } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { colors, dimensions } from '@erxes/ui/src/styles';

const ReportsNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs({})`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

export const ReportsWrapper = styledTS<{ space: number }>(
  styled.div
)`padding-left: ${props => props.space * 20}px;
  display:inline-flex;
  justify-content:flex-start;
  align-items: center;
`;

const Margin = styledTS(styled.div)`
 margin: ${dimensions.unitSpacing}px;
`;

type Props = {
  reports: IReports;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  reportss: IReports[];
  remove: (reports: IReports) => void;
  edit: (reports: IReports) => void;
  types?: IType[];
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  Reportss({ reports, checked }) {
    return (
      <ReportsNameStyled checked={checked}>{reports.name}</ReportsNameStyled>
    );
  }

  removeReports = () => {
    const { remove, reports } = this.props;

    remove(reports);
  };

  toggleCheck = () => {
    const { edit, reports } = this.props;

    edit({ _id: reports._id, checked: !reports.checked });
  };

  render() {
    const { reports, renderButton, space, reportss, types } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="top">
          <Icon icon="edit-3"></Icon>
        </Tip>
      </Button>
    );

    const content = props => (
      <Form
        {...props}
        types={types}
        reports={reports}
        renderButton={renderButton}
        reportss={reportss}
      />
    );

    const extractDate = reports.expiryDate
      ? reports.expiryDate?.toString().split('T')[0]
      : '-';

    return (
      <tr>
        <td>
          <ReportsWrapper space={space}>
            <FormControl
              componentClass="checkbox"
              onChange={this.toggleCheck}
              color={colors.colorPrimary}
              defaultChecked={reports.checked || false}
            ></FormControl>
            <Margin>
              <this.Reportss
                reports={reports}
                checked={reports.checked || false}
              />
            </Margin>
          </ReportsWrapper>
        </td>
        <td>{extractDate}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title="Edit reports"
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={this.removeReports}
                icon="times-circle"
              />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
