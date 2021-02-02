import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import Table from 'modules/common/components/table';
import React from 'react';
import Alert from 'react-bootstrap/Alert';
import { Domain } from '../../styles';

type Props = {
  domain?: string;
  dnsStatus?: string;
  handleFormChange: (name: string, value: string) => void;
};

function CustomDomain({ domain, handleFormChange }: Props) {
  const handleChange = e => {
    handleFormChange('domain', (e.currentTarget as HTMLInputElement).value);
  };

  return (
    <>
      <FormGroup>
        <ControlLabel>DNS Record</ControlLabel>
        <Alert variant="info">
          <Alert.Heading>
            Add the records below to your DNS settings for
          </Alert.Heading>
          <p>
            You need to add both records below. The second record will only be
            available once the first has been set and its status is ACTIVE.
            Please allow up to 24 hours for that to happen, unless you can force
            a DNS refresh with your hosting provider. If you are using
            Cloudflare, make sure you set the records to "DNS only" (grey
            cloud). Unsure of how to change DNS records for your domain? Get in
            touch and we can talk you through it. <br /> For provider-specific
            information, please refer to{' '}
            <a
              rel="noopener noreferrer"
              href="https://erxes.io/help/knowledge-base/article/detail?_id=dfggSKv8ZCKdkwK26"
              target="_blank"
            >
              this guide
            </a>
            .
          </p>
        </Alert>

        <Table striped={true} condensed={true} bordered={true}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th>Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CNAME</td>
              <td>{domain || 'Your domain'}</td>
              <td>.app.erxes.io</td>
              <td>
                <b>{'Undefined'.toUpperCase()}</b>
              </td>
            </tr>
          </tbody>
        </Table>
      </FormGroup>

      <FormGroup>
        <ControlLabel>Custom domain</ControlLabel>
        <Domain>
          <FormControl
            name="domain"
            value={domain}
            type="text"
            onChange={handleChange}
          />
        </Domain>
      </FormGroup>
    </>
  );
}

export default CustomDomain;
