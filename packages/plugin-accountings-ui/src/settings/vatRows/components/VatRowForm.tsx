import { Row } from '@erxes/ui-inbox/src/settings/integrations/styles';
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
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import {
  IButtonMutateProps,
  IFormProps,
} from "@erxes/ui/src/types";
import { __, router } from "@erxes/ui/src/utils/core";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { IVatRow } from '../types';

interface IProps {
  vatRow?: IVatRow;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
}

type State = {
  name: string;
  number: string;
  kind: string;
  formula: string;
  formula_text: string;
  tab_count: number;
  is_bold: boolean;
  status: string;
  percent: number;
};

function VatRowForm(props: IProps): React.ReactNode {
  const location = useLocation();
  const vatRow = props.vatRow || ({} as IVatRow);

  const {
    name,
    number,
    kind,
    formula,
    formula_text,
    tab_count,
    is_bold,
    status,
    percent,
  } = vatRow;

  const [state, setState] = useState<State>({
    ...vatRow,
    name: name ?? '',
    number,
    kind,
    formula,
    formula_text,
    tab_count,
    is_bold,
    status,
    percent,
  });

  const generateDoc = (values: {
    _id?: string;
  }) => {
    const { vatRow } = props;
    const finalValues = values;
    if (vatRow) {
      finalValues._id = vatRow._id;
    }

    return {
      ...vatRow,
      ...state,
      ...finalValues,
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, vatRow } =
      props;
    const { values, isSubmitted } = formProps;
    const object = vatRow || ({} as IVatRow);

    const {
      name,
      number,
      kind,
      formula,
      formula_text,
      tab_count,
      is_bold,
      status,
      percent,
    } = state;

    return (
      <>
        <FormWrapper>
          <FormColumn>
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
                    name: e.target.value.replace(/\*/g, ""),
                  }));
                }}
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
          </FormColumn>
        </FormWrapper>

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
            name: "vatRow and service",
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: vatRow,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default VatRowForm;
