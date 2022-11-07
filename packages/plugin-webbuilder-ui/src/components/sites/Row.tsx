import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import { getEnv, __ } from '@erxes/ui/src/utils/core';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';
import React from 'react';
import { ISiteDoc } from '../../types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from '../../containers/sites/SiteForm';

type Props = {
  site: ISiteDoc;
  remove: (_id: string) => void;
  queryParams: any;
};

function Row({ site, remove, queryParams }: Props) {
  const renderForm = formProps => {
    return <Form {...formProps} site={site} queryParams={queryParams} />;
  };

  const show = () => {
    const { REACT_APP_API_URL } = getEnv();

    const url = `${REACT_APP_API_URL}/pl:webbuilder/${site.name}`;

    window.open(`${url}`, '_blank');
  };

  const renderActions = () => {
    const trigger = (
      <Button id="site-edit-site" btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    return (
      <ActionButtons>
        <ModalTrigger
          title="Edit site"
          trigger={trigger}
          content={renderForm}
        />

        <Tip text={__('Show')} placement="top">
          <Button btnStyle="link" onClick={show} icon="eye" />
        </Tip>

        <Tip text={__('Delete')} placement="top">
          <Button btnStyle="link" onClick={() => remove(site._id)}>
            <Icon icon="times-circle" />
          </Button>
        </Tip>
      </ActionButtons>
    );
  };

  const { name, domain } = site;

  return (
    <tr>
      <td>{name}</td>
      <td>{domain}</td>
      <td>
        <ActionButtons>{renderActions()}</ActionButtons>
      </td>
    </tr>
  );
}

export default Row;
