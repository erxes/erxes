import { colors, FormControl, ModalTrigger, Tip, __ } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import moment from 'moment';
import React from 'react';
import { RiskAssessmentsType } from '../common/types';
import Form from '../containers/Form';
import { Badge } from '../styles';

type IProps = {
  object: RiskAssessmentsType;
  selectedValue: string[];
  onchange: (id: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

class TableRow extends React.Component<IProps> {
  render() {
    const { object, selectedValue, onchange } = this.props;

    const generateDoc = values => {
      return { doc: { ...values }, _id: object._id };
    };

    const onclick = e => {
      e.stopPropagation();
    };

    const trigger = (
      <tr key={object._id}>
        <td onClick={onclick}>
          <FormControl
            componentClass="checkbox"
            checked={selectedValue.includes(object._id)}
            onChange={() => onchange(object._id)}
          />
        </td>
        <td>{object.name}</td>
        <td>{object.category?.name || '-'}</td>
        <td>
          <Badge color={object.statusColor}>{__(object.status)}</Badge>
        </td>
        <Tip text={moment(object.createdAt).format('MM/DD/YYYY HH:mm')} placement="bottom">
          <td>{moment(object.createdAt).fromNow()}</td>
        </Tip>
      </tr>
    );

    const contentForm = props => {
      const updatedProps = {
        ...this.props,
        ...props,
        generateDoc
      };
      return <Form {...updatedProps} asssessmentId={object._id} />;
    };

    return (
      <ModalTrigger
        title="Edit Risk Assessment"
        enforceFocus={false}
        trigger={trigger}
        autoOpenKey="showListFormModal"
        content={contentForm}
        dialogClassName="transform"
        size="lg"
      />
    );
  }
}

export default TableRow;
