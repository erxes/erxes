import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import CommonForm from "@erxes/ui/src/components/form/Form";
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
} from "@erxes/ui/src/styles/main";
import {
  IButtonMutateProps,
  IFormProps,
} from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils/core";
import React, { useState } from "react";
import { ICtaxRow } from '../types';

interface IProps {
  ctaxRow?: ICtaxRow;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
}

type State = {
  name: string;
  number: string;
  kind: string;
  formula: string;
  formulaText: string;
  status: string;
  percent: number;
};

function VatRowForm(props: IProps): React.ReactNode {
  const ctaxRow = props.ctaxRow || ({} as ICtaxRow);

  const {
    name,
    number,
    kind,
    formula,
    formulaText,
    status,
    percent,
  } = ctaxRow;

  const [state, setState] = useState<State>({
    ...ctaxRow,
    name: name ?? '',
    number: number ?? '',
    kind: kind || 'normal',
    formula: formula ?? '',
    formulaText: formulaText ?? '',
    status: status || 'active',
    percent: percent || 0,
  });

  const generateDoc = (values: {
    _id?: string;
  }) => {
    const { ctaxRow } = props;
    const finalValues = values;
    if (ctaxRow) {
      finalValues._id = ctaxRow._id;
    }

    return {
      ...ctaxRow,
      ...state,
      ...finalValues,
      percent: Number(state.percent || 0),
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, ctaxRow } =
      props;
    const { values, isSubmitted } = formProps;

    const {
      name,
      number,
      kind,
      status,
      percent,
    } = state;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Number</ControlLabel>
              <FormControl
                {...formProps}
                name="number"
                value={number}
                required={true}
                onChange={(e: any) => {
                  setState((prevState) => ({
                    ...prevState,
                    number: e.target.value,
                  }));
                }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>Name</ControlLabel>
              <FormControl
                {...formProps}
                name="name"
                value={name}
                required={true}
                onChange={(e: any) => {
                  setState((prevState) => ({
                    ...prevState,
                    name: e.target.value,
                  }));
                }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>Kind</ControlLabel>
              <FormControl
                {...formProps}
                componentclass='select'
                name="kind"
                value={kind || 'normal'}
                options={[
                  { value: '', label: 'normal' },
                  { value: 'formula', label: 'formula' },
                  { value: 'title', label: 'title' },
                  { value: 'hidden', label: 'hidden' },
                ]}
                onChange={(e: any) => {
                  setState((prevState) => ({
                    ...prevState,
                    kind: e.target.value,
                  }));
                }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>Percent</ControlLabel>
              <FormControl
                {...formProps}
                type='number'
                name="percent"
                value={percent}
                required={true}
                max={100}
                min={0}
                onChange={(e: any) => {
                  setState((prevState) => ({
                    ...prevState,
                    percent: Number(e.target.value || 0),
                  }));
                }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>Status</ControlLabel>
              <FormControl
                {...formProps}
                componentclass='select'
                name="status"
                value={status || 'active'}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'deleted', label: 'Deleted' },
                ]}
                onChange={(e: any) => {
                  setState((prevState) => ({
                    ...prevState,
                    status: e.target.value
                  }));
                }}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper >

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: "ctaxRow and service",
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: ctaxRow,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default VatRowForm;
