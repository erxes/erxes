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

type IProps = {
  object: RiskIndicatorsType;
  selectedValue: string[];
  onchange: (id: string) => void;
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

    const renderDuplicateForm = () => {
      const { queryParams } = this.props;
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
          asssessmentId: object._id,
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
        <td>
          <FormContainer gapBetween={5} row maxItemsRow={3}>
            {(object?.tags || []).map(tag => (
              <Label key={tag._id} lblColor={tag.colorCode}>
                {tag.name}
              </Label>
            ))}
          </FormContainer>
        </td>
        <Tip
          text={moment(object.createdAt).format('MM/DD/YYYY HH:mm')}
          placement="bottom"
        >
          <td>{moment(object.createdAt).fromNow()}</td>
        </Tip>
        <td onClick={onclick}>{renderDuplicateForm()}</td>
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
