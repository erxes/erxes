import {
  Button,
  ButtonMutate,
  FormControl,
  Icon,
  Label,
  ModalTrigger,
  Tip
} from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import moment from 'moment';
import React from 'react';
import { FormContainer } from '../../styles';
import { RiskIndicatorsType } from '../common/types';
import { generateParams } from '../common/utils';
import { default as Form } from '../containers/Form';
import { mutations, queries } from '../graphql';
import { isEnabled } from '@erxes/ui/src/utils/core';

type IProps = {
  object: RiskIndicatorsType;
  selectedValue: string[];
  onchange: (id: string) => void;
  queryParams: any;
};

const generateDate = (value, formatted?) => {
  if (formatted) {
    return value ? moment(value).format('MM/DD/YYYY HH:mm') : '-';
  }
  return value ? moment(value).fromNow() : '-';
};

class TableRow extends React.Component<IProps> {
  renderDuplicateForm = () => {
    const { queryParams, object } = this.props;
    const { _id } = object;

    const trigger = (
      <Button btnStyle="link" style={{ padding: '5px' }}>
        <Tip text="Duplicate this risk indicator" placement="bottom">
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
          mutation={mutations.riskIndicatorAdd}
          variables={values}
          isSubmitted={isSubmitted}
          refetchQueries={refetchQueries}
          type="submit"
          successMessage={`Risk Indicator successfully duplicated`}
        />
      );
    };

    const content = props => {
      const updatedProps = {
        ...props,
        asssessmentId: _id,
        fieldsSkip: { description: 0, name: 0 },
        queryParams,
        renderButton
      };
      return <Form {...updatedProps} />;
    };

    return (
      <ModalTrigger
        content={content}
        trigger={trigger}
        title="Duplicate Risk Indicator"
        dialogClassName="transform"
        enforceFocus={false}
        size="lg"
      />
    );
  };

  render() {
    const { object, selectedValue, onchange } = this.props;

    const { _id, name, modifiedAt, createdAt, tags } = object;

    const generateDoc = values => {
      return { doc: { ...values }, _id };
    };

    const onclick = e => {
      e.stopPropagation();
    };

    const trigger = (
      <tr key={_id}>
        <td onClick={onclick}>
          <FormControl
            componentClass="checkbox"
            checked={selectedValue.includes(_id)}
            onChange={() => onchange(_id)}
          />
        </td>
        <td>{name}</td>
        {isEnabled('tags') && (
          <td>
            <FormContainer gapBetween={5} row maxItemsRow={3}>
              {(tags || []).map(tag => (
                <Label key={tag._id} lblColor={tag.colorCode}>
                  {tag.name}
                </Label>
              ))}
            </FormContainer>
          </td>
        )}
        <Tip text={generateDate(createdAt, true)} placement="bottom">
          <td>{generateDate(createdAt)}</td>
        </Tip>
        <Tip text={generateDate(modifiedAt, true)} placement="bottom">
          <td>{generateDate(modifiedAt)}</td>
        </Tip>
        <td onClick={onclick}>{this.renderDuplicateForm()}</td>
      </tr>
    );

    const contentForm = props => {
      const updatedProps = {
        ...this.props,
        ...props,
        generateDoc
      };
      return <Form {...updatedProps} asssessmentId={_id} />;
    };

    return (
      <ModalTrigger
        title="Edit Risk Indicator"
        enforceFocus={false}
        trigger={trigger}
        content={contentForm}
        size="lg"
      />
    );
  }
}

export default TableRow;
