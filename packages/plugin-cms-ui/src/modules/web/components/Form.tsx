import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

const ADD = gql`
  mutation ClientPortalConfigUpdate($config: ClientPortalConfigInput!) {
    clientPortalConfigUpdate(config: $config) {
      _id
    }
  }
`;

type Props = {
  closeModal: () => void;
};

const WebsiteForm = (props: Props) => {
  const navigate = useNavigate();
  const [web, setWeb] = React.useState<any>();

  const [clientPortalConfigUpdate] = useMutation(ADD);

  const renderContent = (formProps: IFormProps) => {
    const { closeModal } = props;

    const renderInput = (
      name: string,
      type: string,
      value: any,
      label: string,
      required?: boolean,
      useNumberFormat?: boolean
    ) => {
      const onChangeInput = (e: any) => {
        if (name === 'name') {
          setWeb({
            ...web,
            name: e.target.value,
            slug: `${e.target.value}`,
          });
        }

        setWeb({
          ...web,
          [name]: e.target.value,
        });
      };

      return (
        <FormGroup>
          <ControlLabel>{__(label)}</ControlLabel>
          <FormControl
            {...formProps}
            id={name}
            name={name}
            type={type}
            required={required}
            useNumberFormat={useNumberFormat}
            defaultValue={value}
            value={value}
            onChange={onChangeInput}
          />
        </FormGroup>
      );
    };

    return (
      <>
        {renderInput('name', 'text', web?.name, 'Name', true)}
        {renderInput('description', 'text', web?.description, 'Description')}



        <ModalFooter>
          <Button btnStyle='simple' onClick={closeModal} icon='times-circle'>
            Close
          </Button>

          <Button
            btnStyle='success'
            icon='check-circle'
            onClick={async () => {
              clientPortalConfigUpdate({
                variables: {
                  config: {
                    ...web,
                    kind:"client",
                },
                },
              }).then((data) => {
                // navigate
                navigate(
                  `/cms/website/${data.data.clientPortalConfigUpdate._id}/posts`
                );
              });

              closeModal();
            }}
          >
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default WebsiteForm;
