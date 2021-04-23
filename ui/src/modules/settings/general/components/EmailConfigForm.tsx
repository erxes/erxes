import gql from 'graphql-tag';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Info from 'modules/common/components/Info';
import EditorCK from 'modules/common/containers/EditorCK';
import { __ } from 'modules/common/utils';
import React from 'react';
import { useQuery } from 'react-apollo';
import styled from 'styled-components';
import { queries } from '../graphql';

type Props = {
  emailConfig: any;
  setEmailConfig: (emailConfig: any) => void;
  emailText: string;
  templateName?: string;
  isSaved?: boolean;
};

const ContentWrapper = styled.div`
  margin-top: 20px;
`;

const EmailConfigForm = (props: Props) => {
  const { data } = useQuery(gql(queries.configsGetEmailTemplate), {
    variables: {
      name: props.templateName
    }
  });

  const defaultTemplate = data ? data.configsGetEmailTemplate : {};

  const { emailText, emailConfig, setEmailConfig } = props;

  const email = emailConfig.email || '';
  const type = emailConfig.type || 'simple';
  const template = emailConfig.template || defaultTemplate;

  const onChangeEmail = (e: any) => {
    setEmailConfig({
      type,
      template,
      email: e.target.value
    });
  };

  const onChangeType = (e: any) => {
    setEmailConfig({
      email,
      template,
      type: e.target.value
    });
  };

  const onEditorChange = (e: any) => {
    setEmailConfig({
      type,
      email,
      template: e.editor.getData()
    });
  };

  const renderTemplate = () => {
    if (type === 'custom') {
      return (
        <ContentWrapper>
          <EditorCK
            content={template}
            onChange={onEditorChange}
            autoGrow={true}
            name="email_config"
            isSubmitted={props.isSaved}
          />
        </ContentWrapper>
      );
    }

    return (
      <ContentWrapper>
        <Info>
          {__('Your email will be sent with Erxes email template') + '.'}
        </Info>
      </ContentWrapper>
    );
  };

  return (
    <>
      <FormGroup>
        <ControlLabel>Email</ControlLabel>
        <p>{emailText}</p>

        <FormControl
          type="email"
          rows={5}
          value={email}
          onChange={onChangeEmail}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>Type</ControlLabel>
        <p>Choose "custom" to change the template of transactional emails.</p>

        <FormControl
          componentClass="select"
          value={type}
          onChange={onChangeType}
        >
          <option key="simple" value="simple">
            Simple
          </option>
          <option key="custom" value="custom">
            Custom
          </option>
        </FormControl>
      </FormGroup>

      <FormGroup>
        <ControlLabel>Template</ControlLabel>

        {renderTemplate()}
      </FormGroup>
    </>
  );
};

export default EmailConfigForm;
