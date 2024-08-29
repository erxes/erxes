import React, { useState, useEffect } from 'react';
import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Info from '@erxes/ui/src/components/Info';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { MarkdownWrapper } from '@erxes/ui-settings/src/styles';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactMarkdown from 'react-markdown';
import { ILeadIntegration } from '@erxes/ui-leads/src/types';
import { getEnv } from '@erxes/ui/src/utils/core';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  integration: ILeadIntegration;
  closeModal: () => void;
};

const installCodeIncludeScript = (type: string) => {
  const { REACT_APP_CDN_HOST } = getEnv();

  return `
    (function() {
      var script = document.createElement('script');
      script.src = "${REACT_APP_CDN_HOST}/build/${type}Widget.bundle.js";
      script.async = true;

      var entry = document.getElementsByTagName('script')[0];
      entry.parentNode.insertBefore(script, entry);
    })();
  `;
};

const getInstallCode = (brandCode: string, formCode: string) => {
  return `
    <script>
      window.erxesSettings = {
        forms: [{
          brand_id: "${brandCode}",
          form_id: "${formCode}"
        }],
      };
      ${installCodeIncludeScript('form')}
    </script>
  `;
};

const getEmbedCode = (formCode: string) => {
  return `
    <div data-erxes-embed="${formCode}" style="width:900px;height:300px"></div>
  `;
};

const getButtonCode = (formCode: string) => {
  return `
    data-erxes-modal="${formCode}"
  `;
};

const Manage: React.FC<Props> = ({ integration, closeModal }) => {
  const [code, setCode] = useState<string>('');
  const [embedCode, setEmbedCode] = useState<string>('');
  const [buttonCode, setButtonCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (integration._id) {
      const brand = integration.brand;
      const form = integration.form || ({} as any);

      if (brand) {
        setCode(getInstallCode(brand.code, form.code || ''));
      }

      setEmbedCode(getEmbedCode(form.code || ''));
      setButtonCode(getButtonCode(form.code || ''));
    }
  }, [integration]);

  const onSimulate = () => {
    const { REACT_APP_CDN_HOST } = getEnv();
    const brand = integration.brand || ({} as ILeadIntegration);
    const form = integration.form || ({} as any);

    window.open(
      `${REACT_APP_CDN_HOST}/test?type=form&brand_id=${brand.code}&form_id=${form.code}`,
      'formrWindow',
      'width=800,height=800'
    );
  };

  const onCopy = () => setCopied(true);

  const renderContent = () => (
    <>
      <MarkdownWrapper>
        <ReactMarkdown children={code || ''} />
        {code ? (
          <CopyToClipboard text={code} onCopy={onCopy}>
            <Button btnStyle="primary" icon="copy-1">
              {copied ? 'Copied' : 'Copy to clipboard'}
            </Button>
          </CopyToClipboard>
        ) : (
          <EmptyState
            icon="copy"
            text="No copyable code. You should connect Form to brand first"
            size="small"
          />
        )}
      </MarkdownWrapper>
      <br />
      <Info>
        {__('If your form style is embedded, additionally paste this code after the main code.')}
      </Info>
      <MarkdownWrapper>
        <ReactMarkdown children={embedCode || ''} />
      </MarkdownWrapper>
      <br />
      <Info>
        {__('If your form style is a popup, additionally paste this code after the main code.')}
      </Info>
      <MarkdownWrapper>
        <ReactMarkdown children={buttonCode || ''} />
      </MarkdownWrapper>
    </>
  );

  return (
    <>
      <Info>
        {__(' Paste this main code before the body tag on every page you want this form to appear.')}
      </Info>

      {renderContent()}

      <ModalFooter>
        <Button
          btnStyle="primary"
          icon="plus-circle"
          onClick={onSimulate}
        >
          Simulate
        </Button>

        <Button
          btnStyle="simple"
          icon="times-circle"
          onClick={closeModal}
        >
          Close
        </Button>
      </ModalFooter>
    </>
  );
};

export default Manage;
