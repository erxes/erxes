import { consumeRPCQueue } from "../messageBroker";

export const formConsumers = ({ name, forms }) => {
  if (forms.fields) {
    consumeRPCQueue(`${name}:fields.getList`, async args => ({
      status: "success",
      data: await forms.fields(args)
    }));
  }

  if (forms.groupsFilter) {
    consumeRPCQueue(`${name}:fields.groupsFilter`, async args => ({
      status: "success",
      data: await forms.groupsFilter(args)
    }));
  }

  if (forms.systemFields) {
    forms.systemFieldsAvailable = true;

    consumeRPCQueue(`${name}:systemFields`, async args => ({
      status: "success",
      data: await forms.systemFields(args)
    }));
  }

  if (forms.fieldsGroupsHook) {
    forms.groupsHookAvailable = true;

    consumeRPCQueue(`${name}:fieldsGroupsHook`, async args => ({
      status: "success",
      data: await forms.fieldsGroupsHook(args)
    }));
  }

  if (forms.relations) {
    forms.relationsAvailable = true;

    consumeRPCQueue(`${name}:relations`, async args => ({
      status: "success",
      data: await forms.relations(args)
    }));
  }
};
