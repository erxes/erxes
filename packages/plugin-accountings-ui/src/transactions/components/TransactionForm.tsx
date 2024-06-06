import {
  Alert,
  Button,
  ButtonMutate,
  Step,
  Steps,
  Wrapper,
  __,
} from '@erxes/ui/src';
import {
  ControlWrapper,
  Indicator,
  StepWrapper,
} from '@erxes/ui/src/components/step/styles';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IHiddenTransaction, ITransaction } from '../types';
import { LeftContent } from '@erxes/ui-settings/src/styles';

type Props = {
  transactions?: ITransaction | IHiddenTransaction;
  loading?: boolean;
  save: (params: any) => void;
};

const Pos = (props: Props) => {
  const {
    transactions,
    loading,
    save,
  } = props;

  const [state, setState] = useState({

  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const onChange = (key: string, value: any) => {
    setState((prevState) => ({ ...prevState, [key]: value }));
  };

  const renderButtons = () => {
    const SmallLoader = ButtonMutate.SmallLoader;

    const cancelButton = (
      <Link to={`/pos`}>
        <Button btnStyle="simple" icon="times-circle">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}

        <Button
          btnStyle="success"
          icon={'check-circle'}
          onClick={handleSubmit}
        >
          Save
        </Button>
      </Button.Group>
    );
  };

  const breadcrumb = [{ title: 'POS List', link: `/pos` }, { title: 'POS' }];

  return (
    <StepWrapper>
      <Wrapper.Header title={__('Pos')} breadcrumb={breadcrumb} />
      <LeftContent>
        <ControlWrapper>
          <Indicator>
            {__('You are')} {state.pos ? 'editing' : 'creating'}{' '}
            <strong>{state.pos.name || ''}</strong> {__('pos')}
          </Indicator>
          {renderButtons()}
        </ControlWrapper>
      </LeftContent>
    </StepWrapper>
  );
};

export default Pos;
