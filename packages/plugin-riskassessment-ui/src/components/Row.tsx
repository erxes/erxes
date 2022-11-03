import { Button, ButtonMutate, FormControl, Icon, ModalTrigger, Tip, __ } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import moment from 'moment';
import React from 'react';
import { RiskAssessmentsType } from '../common/types';
import { default as Form, default as FormContainer } from '../containers/Form';
import { generateParams } from '../containers/List';
import { mutations, queries } from '../graphql';
import { Badge } from '../styles';

type IProps = {
  object: RiskAssessmentsType;
  selectedValue: string[];
  onchange: (id: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  queryParams: any;
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

    const renderForm = () => {
      const { queryParams } = this.props;
      const trigger = (
        <Button btnStyle="link">
          <Tip text="Duplicate this risk assessment">
            <Icon icon="copy" />
          </Tip>
        </Button>
      );

      const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
        const refetchQueries = [
          {
            query: gql(queries.list),
            variables: {
              ...generateParams({ queryParams })
            }
          }
        ];
        return (
          <ButtonMutate
            mutation={mutations.riskAssessmentAdd}
            variables={values}
            isSubmitted={isSubmitted}
            refetchQueries={refetchQueries}
            type="submit"
            successMessage={`Risk Assessment successfully duplicated`}
          />
        );
      };

      const content = props => {
        const updatedProps = {
          ...props,
          asssessmentId: object._id,
          fieldsSkip: { description: 0, name: 0 },
          renderButton
        };
        return <FormContainer {...updatedProps} />;
      };

      return (
        <ModalTrigger
          content={content}
          trigger={trigger}
          title="Duplicate Risk Assessment"
          dialogClassName="transform"
          size="lg"
        />
      );
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
        <td>{object.status !== 'In Progress' ? __(object.resultScore?.toString() || '') : '-'}</td>
        <Tip text={moment(object.createdAt).format('MM/DD/YYYY HH:mm')} placement="bottom">
          <td>{moment(object.createdAt).fromNow()}</td>
        </Tip>
        <td onClick={onclick}>{renderForm()}</td>
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
