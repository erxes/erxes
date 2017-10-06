import mongoose from 'mongoose';
import shortid from 'shortid';
import Integrations from './Integrations';

const FormSchema = mongoose.Schema({
  _id: {
    type: String,
    default: shortid.generate,
  },
  title: String,
  description: String,
  code: String,
  createdUserId: String,
  createdDate: Date,
});

class Form {
  static async generateCode() {
    // generate code automatically
    let code = shortid.generate().substr(0, 6);
    let foundForm = await Forms.findOne({ code });

    while (foundForm) {
      code = shortid.generate().substr(0, 6);
      foundForm = await Forms.findOne({ code });
    }

    return code;
  }

  static async createForm(doc) {
    const { createdUserId } = doc;

    if (!createdUserId) {
      throw 'createdUserId must be supplied';
    }

    doc.code = await this.generateCode();
    doc.createdDate = new Date();

    return this.create(doc);
  }

  static updateForm(_id, doc) {
    return this.update({ _id }, doc);
  }

  static async removeForm(_id) {
    const fieldCount = await FormFields.find({ formId: _id }).count();

    if (fieldCount > 0) {
      throw 'You cannot delete this form. This form has some fields.';
    }

    const integrationCount = await Integrations.find({ formId: _id }).count();

    if (integrationCount > 0) {
      throw 'You cannot delete this form. This form used in integration.';
    }

    return this.remove({ _id });
  }

  static async updateFormFieldsOrder(orderDics) {
    // update each field's order
    for (let orderDic of orderDics) {
      await FormFields.updateFormField(orderDic.id, { order: orderDic.order });
    }
  }

  static async duplicate(_id) {
    const form = await this.findOne({ _id });

    // duplicate form
    const newForm = await this.createForm({
      title: `${form.title} duplicated`,
      description: form.description,
      createdUserId: form.createdUserId,
    });

    // duplicate fields
    const formFields = await FormFields.find({ formId: _id });

    for (let field of formFields) {
      await FormFields.createFormField(newForm._id, {
        type: field.type,
        validation: field.validation,
        text: field.text,
        description: field.description,
        options: field.options,
        isRequired: field.isRequired,
        order: field.order,
      });
    }

    return newForm;
  }
}

FormSchema.loadClass(Form);
export const Forms = mongoose.model('forms', FormSchema);

const FormFieldSchema = mongoose.Schema({
  _id: {
    type: String,
    default: shortid.generate,
  },
  type: String,
  validation: String,
  text: String,
  description: String,
  options: [String],
  isRequired: Boolean,
  formId: {
    required: true,
    type: String,
  },
  order: Number,
});

class FormField {
  static async createFormField(formId, doc) {
    const lastField = await FormFields.findOne({}, { order: 1 }, { sort: { order: -1 } });
    doc.formId = formId;

    // if there is no field then start with 0
    let order = 0;
    if (lastField) {
      order = lastField.order + 1;
    }
    doc.order = order;

    return this.create(doc);
  }

  static updateFormField(id, doc) {
    return this.update({ _id: id }, doc);
  }

  static removeFormField(id) {
    return this.remove({ _id: id });
  }
}

FormFieldSchema.loadClass(FormField);
export const FormFields = mongoose.model('form_fields', FormFieldSchema);
