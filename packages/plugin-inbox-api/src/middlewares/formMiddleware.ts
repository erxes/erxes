import { getSubdomain } from "@erxes/api-utils/src/core";
import { IModels, generateModels } from "../connectionResolver";

import { sendCoreMessage } from "../messageBroker";

const formMiddleware = async (req, res, _next) => {
  const subdomain = getSubdomain(req);
  let models: IModels;

  try {
    models = await generateModels(subdomain);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  const formId = req.params.id;

  const form = await sendCoreMessage({
    subdomain,
    action: "formsFindOne",
    data: { _id: formId },
    isRPC: true
  });

  if (!form) {
    throw new Error("Form not found");
  }

  const params = (await req.body) || ({} as any);

  const fields = await sendCoreMessage({
    subdomain,
    action: "fields.find",
    data: {
      query: {
        contentType: "form",
        contentTypeId: formId
      },
      sort: {
        order: 1
      }
    },
    isRPC: true,
    defaultValue: []
  });

  const submissions = [] as any;

  for (const field of fields) {
    if (field.validation === "datetime") {
      submissions.push({
        _id: field._id,
        type: field.type,
        text: field.text,
        value: params.date,
        validation: field.validation,
        associatedFieldId: "",
        column: null
      });
    }

    if (field.type === "textarea") {
      submissions.push({
        _id: field._id,
        type: field.type,
        text: field.text,
        value: params.description,
        validation: field.validation,
        associatedFieldId: "",
        column: null
      });
    }

    if (field.type === "email") {
      submissions.push({
        _id: field._id,
        type: field.type,
        text: field.text,
        value: params.customerEmail,
        validation: field.validation,
        associatedFieldId: "",
        column: null
      });
    }

    if (field.type === "phone") {
      submissions.push({
        _id: field._id,
        type: field.type,
        text: field.text,
        value: params.customerPhone,
        validation: field.validation,
        associatedFieldId: "",
        column: null
      });
    }

    if (field.type === "firstName") {
      submissions.push({
        _id: field._id,
        type: field.type,
        text: field.text,
        value: params.customerName,
        validation: field.validation,
        associatedFieldId: "",
        column: null
      });
    }
  }

  const integration = await models.Integrations.findOne({
    formId: form._id
  });

  const submissionParams = {
    integrationId: integration?._id || "",
    formId: form._id,
    submissions,
    browserInfo: {}
  };

  // await createFormConversation(
  //   models,
  //   subdomain,
  //   {
  //     ...submissionParams
  //   },
  //   form => {
  //     return form.title;
  //   },
  //   () => {
  //     return {
  //       message: {
  //         formWidgetData: submissions
  //       }
  //     };
  //   },
  //   "lead"
  // );

  return res.json("success");
};

export default formMiddleware;
