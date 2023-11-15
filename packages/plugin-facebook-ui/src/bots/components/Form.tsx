import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  SortItem,
  __
} from '@erxes/ui/src';
import CommonForm from '@erxes/ui/src/components/form/Form';
import { Column, LinkButton, ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { SelectAccount, SelectAccountPages } from '../utils';
import { Features } from '../styles';
import { Columns } from '@erxes/ui/src/styles/chooser';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  bot?: any;
};

type State = {
  doc: any;
};

function removeNullAndTypename(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeNullAndTypename);
  }

  const cleanedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== null && key !== '__typename') {
      cleanedObj[key] = removeNullAndTypename(obj[key]);
    }
  }

  return cleanedObj;
}

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      doc: props?.bot ? props.bot : null
    };
  }

  generateDoc(values) {
    const { doc } = this.state;

    return { ...removeNullAndTypename(doc || {}), ...values };
  }

  renderPersistentMenus(doc) {
    const { persistentMenus = [] } = doc || {};

    const addPersistentMenu = () => {
      this.setState({
        doc: {
          ...doc,
          persistentMenus: [
            ...persistentMenus,
            { _id: Math.random(), title: '' }
          ]
        }
      });
    };

    const onChange = (_id, name, value) => {
      this.setState({
        doc: {
          ...doc,
          persistentMenus: persistentMenus.map(persistentMenu =>
            persistentMenu._id === _id
              ? { ...persistentMenu, [name]: value }
              : persistentMenu
          )
        }
      });
    };

    const handleChange = (_id, e) => {
      const { name, value } = e.currentTarget as HTMLInputElement;

      onChange(_id, name, value);
    };

    const setUseUrl = _id => {
      onChange(_id, 'type', 'web_url');
    };

    const handleRemove = _id => {
      this.setState({
        doc: {
          ...doc,
          persistentMenus: persistentMenus.filter(
            persistentMenu => persistentMenu._id !== _id
          )
        }
      });
    };

    return (
      <>
        {persistentMenus.map(persistentMenu => (
          <SortItem isDragging={false} isModal={false}>
            <Columns>
              <Column>
                <FormControl
                  name="title"
                  value={persistentMenu?.title}
                  onChange={e => handleChange(persistentMenu._id, e)}
                />
              </Column>

              {persistentMenu?.type === 'web_url' ? (
                <Column>
                  <FormControl
                    name="url"
                    onChange={e => handleChange(persistentMenu._id, e)}
                    value={persistentMenu?.url}
                  />
                </Column>
              ) : (
                <LinkButton onClick={setUseUrl.bind(this, persistentMenu._id)}>
                  {__('Set Url')}
                </LinkButton>
              )}
            </Columns>
            <Icon
              icon="cancel-1"
              style={{ cursor: 'pointer' }}
              onClick={handleRemove.bind(this, persistentMenu?._id)}
            />
          </SortItem>
        ))}
        <LinkButton onClick={addPersistentMenu}>
          {__('Add Persistent Menu')}
        </LinkButton>
      </>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { isSubmitted, values } = formProps;

    const { renderButton, closeModal, bot } = this.props;
    const { doc } = this.state;

    const onSelect = (value, name) => {
      this.setState({ doc: { ...doc, [name]: value } });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Name')}</ControlLabel>
          <FormControl {...formProps} name="name" required value={doc?.name} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Accounts')}</ControlLabel>
          <SelectAccount
            initialValue={doc?.accountId}
            name="accountId"
            label="select a account"
            onSelect={onSelect}
          />
        </FormGroup>
        <Features isToggled={doc?.accountId}>
          <FormGroup>
            <ControlLabel>{__('Pages')}</ControlLabel>
            <SelectAccountPages
              accountId={doc?.accountId}
              initialValue={doc?.pageId}
              name="pageId"
              label="select a page"
              onSelect={onSelect}
            />
          </FormGroup>
          {this.renderPersistentMenus(doc)}
        </Features>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Close')}
          </Button>
          {renderButton({
            name: 'Bot',
            values: this.generateDoc(values),
            isSubmitted,
            object: bot
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
