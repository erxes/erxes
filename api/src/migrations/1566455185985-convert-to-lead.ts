import { connect } from '../db/connection';
import { Forms, FormSubmissions, Integrations } from '../db/models';
import { IFormDocument } from '../db/models/definitions/forms';

module.exports.up = async () => {
  await connect();

  const forms: IFormDocument[] = await Forms.find();

  for (const form of forms) {
    const integration = await Integrations.findOne({ formId: form._id });

    if (integration && integration.formData) {
      const leadData = {
        loadType: integration.formData.loadType,
        successAction: integration.formData.successAction,
        fromEmail: integration.formData.fromEmail,
        userEmailTitle: integration.formData.userEmailTitle,
        userEmailContent: integration.formData.userEmailContent,
        adminEmails: integration.formData.adminEmails,
        adminEmailTitle: integration.formData.adminEmailTitle,
        adminEmailContent: integration.formData.adminEmailContent,
        thankContent: integration.formData.thankContent,
        redirectUrl: integration.formData.redirectUrl,
        themeColor: form.themeColor,
        callout: form.callout,
        rules: form.rules,
        viewCount: form.viewCount,
        contactsGathered: form.contactsGathered,
      };

      const submissions = form.submissions || [];

      for (const submission of submissions) {
        await FormSubmissions.createFormSubmission({
          formId: form._id,
          customerId: submission.customerId,
          submittedAt: submission.submittedAt,
        });
      }

      await Integrations.updateOne(
        { formId: form._id },
        {
          $set: { kind: 'lead', leadData },
          $unset: { formData: 1 },
        },
      );

      await Forms.updateOne(
        { _id: form._id },
        {
          $unset: {
            themeColor: 1,
            callout: 1,
            rules: 1,
            viewCount: 1,
            contactsGathered: 1,
            submissions: 1,
          },
        },
      );
    }
  }

  return Promise.resolve('ok');
};
