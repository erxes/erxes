import commonListComposer from './commonListComposer';
import confirm from './confirmation/confirm';
import Alert from './Alert';
import React from 'react';
import T from 'i18n-react';

export function withProps<IProps>(
  Wrapped: new (props: IProps) => React.Component<IProps>
) {
  return class WithProps extends React.Component<IProps, {}> {
    render() {
      return <Wrapped {...this.props} />;
    }
  };
}

export const __ = (key: string, options?: any) => {
  const translation = T.translate(key, options);

  if (!translation) {
    return '';
  }

  return translation.toString();
};

export { commonListComposer, Alert, confirm };
