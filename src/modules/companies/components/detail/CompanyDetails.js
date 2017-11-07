import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Icon } from 'modules/common/components';
import {
  List as InternalNotes,
  Form as NoteForm
} from 'modules/internalNotes/containers';
import { Tabs, TabTitle } from 'modules/common/components';
import { WhiteBox } from 'modules/layout/styles';
import LeftSidebar from './LeftSidebar';

const propTypes = {
  company: PropTypes.object.isRequired,
  customFields: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
  queryParams: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired
};

class CompanyDetails extends React.Component {
  render() {
    const { currentUser, company } = this.props;

    const breadcrumb = [
      { title: 'Companies', link: '/companies' },
      { title: company.name || company.email || 'N/A' }
    ];

    const content = (
      <div>
        <WhiteBox>
          <Tabs>
            <TabTitle className="active">
              <Icon icon="compose" /> New note
            </TabTitle>
          </Tabs>

          <NoteForm contentType="company" contentTypeId={company._id} />
        </WhiteBox>

        {
          <InternalNotes
            contentType="company"
            contentTypeId={company._id}
            currentUserId={currentUser._id}
          />
        }
      </div>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<LeftSidebar {...this.props} />}
        content={content}
        transparent={true}
      />
    );
  }
}

CompanyDetails.propTypes = propTypes;

export default CompanyDetails;
