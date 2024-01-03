import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Toggle from '@erxes/ui/src/components/Toggle';
import EditorCK from '@erxes/ui/src/containers/EditorCK';
import { FlexContent } from '@erxes/ui/src/layout/styles';
import { __ } from '@erxes/ui/src/utils/core';

import React from 'react';

import { ToggleWrap } from '../../styles';
import { PasswordVerificationConfig } from '../../types';

type Props = {
  config?: PasswordVerificationConfig;
  onChange: (name: string, value: any) => void;
};

const PasswordConfig = (props: Props) => {
  const [config, setConfig] = React.useState<PasswordVerificationConfig>(
    props.config || {
      verifyByOTP: false,
      emailSubject: 'Reset your password',
      emailContent: ' {{ link }} ',
      smsContent: ' {{ link }} '
    }
  );

  const [editorAttrs, setEditorAttrs] = React.useState<any>(
    config.verifyByOTP
      ? {
          value: 'code',
          name: 'Code'
        }
      : {
          value: 'link',
          name: 'Link'
        }
  );

  const onChangeToggle = (value: boolean) => {
    if (value) {
      setConfig({
        ...config,
        verifyByOTP: value,
        smsContent: config.smsContent.replace('{{ link }}', '{{ code }}'),
        emailContent: config.emailContent.replace('{{ link }}', '{{ code }}')
      });

      setEditorAttrs({
        value: 'code',
        name: 'Code'
      });
    } else {
      setConfig({
        ...config,
        verifyByOTP: value,
        smsContent: config.smsContent.replace('{{ code }}', '{{ link }}'),
        emailContent: config.emailContent.replace('{{ code }}', '{{ link }}')
      });

      setEditorAttrs({
        value: 'link',
        name: 'Link'
      });
    }

    props.onChange('passwordVerificationConfig', config);
  };

  const onEditorChange = e => {
    const value = e.editor.getData();

    setConfig({ ...config, emailContent: value });

    props.onChange('passwordVerificationConfig', config);
  };

  const onChange = e => {
    const { name, value } = e.currentTarget;
    if (name === 'smsContent') {
      let content = value;

      const base = config.verifyByOTP ? ' {{ code }} ' : ' {{ link }} ';
      const regex = new RegExp('[sS]*?' + base + '[sS]*?', 'i');

      if (config.verifyByOTP) {
        if (!regex.test(value)) {
          content = content.replace(/{{ code }}/g, base);
          if (content.search(base) === -1) {
            content = base;
          }

          content = content.replace('  ', ' ');

          return setConfig({ ...config, [name]: content });
        }
      }

      if (!config.verifyByOTP) {
        if (!regex.test(value)) {
          content = content.replace(/{{ link }}/g, base);
          if (content.search(base) === -1) {
            content = base;
          }

          content = content.replace('  ', ' ');

          return setConfig({ ...config, [name]: content });
        }
      }
    }

    setConfig({ ...config, [name]: value });
    props.onChange('passwordVerificationConfig', config);
  };

  return (
    <CollapseContent
      title={__('Password settings')}
      description={__('Forgot password configuration')}
      compact={true}
      open={false}
    >
      <ToggleWrap>
        <FormGroup>
          <ControlLabel>Use code</ControlLabel>
          <p>{__('Use random code instead of link')}</p>
          <Toggle
            checked={config?.verifyByOTP}
            onChange={() => onChangeToggle(!config.verifyByOTP)}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
          />
        </FormGroup>
      </ToggleWrap>

      <FormGroup>
        <ControlLabel required={true}>SMS Content</ControlLabel>
        <FlexContent>
          <FormControl
            id="content"
            name="smsContent"
            value={config.smsContent}
            onChange={onChange}
          />
        </FlexContent>
      </FormGroup>

      <FormGroup>
        <ControlLabel required={true}>Subject</ControlLabel>
        <p>{__('Forgot password mail subject')}</p>
        <FlexContent>
          <FormControl
            id="emailSubject"
            name="emailSubject"
            value={config.emailSubject}
            onChange={onChange}
          />
        </FlexContent>
      </FormGroup>

      <FormGroup>
        <ControlLabel required={true}>Mail Content</ControlLabel>
        <p>{__('Forgot password mail body')}</p>
        <FlexContent>
          <EditorCK
            content={config.emailContent || ''}
            onChange={onEditorChange}
            height={300}
            name={'emailContent'}
            insertItems={{
              items: [editorAttrs],
              title: 'Attributes',
              label: 'Attributes'
            }}
          />
        </FlexContent>
      </FormGroup>
    </CollapseContent>
  );
};

export default PasswordConfig;
