import * as React from 'react';
import { IUser } from '../../auth/types';
import { IBrand } from '../../settings/brands/types';
import { VisitorForm } from '../components';
import FormBase from '../components/FormBase';
import { IEngageMessage, IEngageMessageDoc } from '../types';
import withFormMutations from './withFormMutations';

type Props = {
  kind: string;
  brands: IBrand[];
  users: IUser[];
  save: (doc: IEngageMessageDoc) => Promise<any>;
  message?: IEngageMessage;
};

class VisitorFormContainer extends React.Component<Props> {
  render() {
    const content = props => <VisitorForm {...this.props} {...props} />;

    return <FormBase kind={this.props.kind} content={content} />;
  }
}

export default withFormMutations(VisitorFormContainer);
