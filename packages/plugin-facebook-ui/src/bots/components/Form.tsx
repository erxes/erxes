import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  SortItem,
  __,
  colors
} from '@erxes/ui/src';
import { ActionButton } from '@erxes/ui/src/components/ActionButtons';
import CommonForm from '@erxes/ui/src/components/form/Form';
import { LinkButton, ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import LinkAction from '../../automations/components/LinkAction';
import { Features } from '../styles';
import { SelectAccount, SelectAccountPages } from '../utils';

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
      const { value, name } = e.currentTarget as HTMLInputElement;

      onChange(_id, 'type', 'web_url');
      onChange(_id, name, value);
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
      <FormGroup>
        <ControlLabel>{__('Persistence Menu')}</ControlLabel>
        {persistentMenus.map(({ _id, title, url }) => (
          <SortItem key={_id} isDragging={false} isModal={false}>
            <FormControl
              placeholder="type a title"
              name="title"
              value={title}
              onChange={e => handleChange(_id, e)}
            />
            <ActionButton>
              <LinkAction
                container={this}
                name="url"
                link={url}
                onChange={e => handleChange(_id, e)}
              />
              <Icon
                icon="cancel-1"
                color={colors.colorCoreRed}
                style={{ cursor: 'pointer' }}
                onClick={handleRemove.bind(this, _id)}
              />
            </ActionButton>
          </SortItem>
        ))}
        <LinkButton onClick={addPersistentMenu}>
          {__('Add Persistent Menu')}
        </LinkButton>
      </FormGroup>
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
