import { PropsWithChildren } from 'react';

const PmsFormFieldsLayout = ({ children }: PropsWithChildren) => {
  return <div className="flex flex-col gap-4 mb-5">{children}</div>;
};

export default PmsFormFieldsLayout;
