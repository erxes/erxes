import React from 'react';
import { IUser } from '../../auth/types';
import { IBrand } from '../../settings/brands/types';
import FormBase from '../components/FormBase';
import VisitorForm from '../components/VisitorForm';
import { IEngageMessage, IEngageMessageDoc } from '../types';
import withFormMutations from './withFormMutations';

type Props = {
  kind?: string;
  brands: IBrand[];
};

type FinalProps = {
  users: IUser[];
  save: (doc: IEngageMessageDoc) => Promise<any>;
  message?: IEngageMessage;
} & Props;

class VisitorFormContainer extends React.Component<FinalProps> {
  render() {
    const content = props => <VisitorForm {...this.props} {...props} />;

    return <FormBase kind={this.props.kind || ''} content={content} />;
  }
}

export default withFormMutations<Props>(VisitorFormContainer);
