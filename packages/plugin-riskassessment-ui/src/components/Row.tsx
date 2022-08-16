import { FormControl, ModalTrigger } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import Form from '../containers/Form';

type IProps = {
  object: any;
  selectedValue: string[];
  onchange: (id: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

class TableRow extends React.Component<IProps> {
  render() {
    const { object, selectedValue, onchange } = this.props;

    const generateDoc = (values) => {
      return { doc: { ...values }, _id: object._id };
    };

    const onclick = (e) => {
      e.stopPropagation();
    };

    const trigger = (
      <tr key={object._id}>
        <td onClick={onclick}>
          <FormControl componentClass="checkbox" checked={selectedValue.includes(object._id)} onChange={() => onchange(object._id)} />
        </td>
        <td>{object.name}</td>
        <td>{object.categoryId}</td>
        <td>{object.status}</td>
      </tr>
    );

    const contentForm = (props) => {
      const updatedProps = {
        ...this.props,
        ...props,
        generateDoc,
      };
      return <Form {...updatedProps} asssessmentId={object._id} />;
    };

    return <ModalTrigger title="Edit Risk Assessment" enforceFocus={false} trigger={trigger} autoOpenKey="showListFormModal" content={contentForm} dialogClassName="transform" />;
  }
}

export default TableRow;
