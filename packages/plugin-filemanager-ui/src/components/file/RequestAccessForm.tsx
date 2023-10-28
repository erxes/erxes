import { AccessPopup, RequestAccessWrapper } from './styles';
import React, { useState } from 'react';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  requestAccess: (attr: any, callback?: () => void) => void;
  fileId: string;
};

function RequestAccessForm({ requestAccess, fileId }: Props) {
  const [description, setDesc] = useState('');

  const onRequest = callback => {
    requestAccess(
      {
        fileId,
        description
      },
      callback
    );
  };

  const renderForm = props => {
    const onChange = e => setDesc((e.target as HTMLInputElement).value);

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <p>{__('You can write description or not')}</p>
          <FormControl
            name="description"
            componentClass="textarea"
            rows={3}
            onChange={onChange}
            autoFocus={true}
            value={description}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={props.closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          <Button
            type="submit"
            btnStyle="success"
            icon="key-skeleton-alt"
            onClick={() => onRequest(props.closeModal)}
          >
            {__('Request')}
          </Button>
        </ModalFooter>
      </>
    );
  };

  return (
    <RequestAccessWrapper>
      <AccessPopup>
        <img src="/images/actions/36.svg" />
        <h3>{__('You need permission')}</h3>
        <p>
          {__('Want in? Ask for access, or log in account with permission')}
        </p>
        <ModalTrigger
          title="Request access"
          trigger={
            <Button btnStyle="primary" type="button" icon={'key-skeleton-alt'}>
              Request access
            </Button>
          }
          content={props => renderForm(props)}
          centered={true}
          enforceFocus={false}
        />
      </AccessPopup>
    </RequestAccessWrapper>
  );
}

export default RequestAccessForm;
