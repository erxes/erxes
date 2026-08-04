import { FormSubmissions } from '@/forms/components/submissions/components/form-submissions';
import { SubmissionDetails } from '@/forms/components/submissions/components/submission-details';
import { SubmissionsSubHeader } from '@/forms/components/submissions/components/submissions-sub-header';

const FormSubmissionsPage = () => {
  return (
    <>
      <SubmissionsSubHeader />
      <FormSubmissions />
      <SubmissionDetails />
    </>
  );
};

export default FormSubmissionsPage;
