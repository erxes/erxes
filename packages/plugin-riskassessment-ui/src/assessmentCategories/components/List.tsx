import React from 'react';
import { DefaultWrapper } from '../../common/utils';
import FormContainer from '../container/Form';
class AssessmentCategories extends React.Component {
  rightActionBar = (<FormContainer />);

  contentForm = () => {
    return <></>;
  };

  render() {
    const updatedProps = {
      title: 'Assessment Category',
      content: this.contentForm(),
      rightActionBar: this.rightActionBar,
    };
    return <DefaultWrapper {...updatedProps} />;
  }
}
export default AssessmentCategories;
