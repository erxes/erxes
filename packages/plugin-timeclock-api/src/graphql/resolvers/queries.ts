import { IContext } from '../../connectionResolver';

const templateQueries = {
  timeclocks(
    _root,
    { date }: { date: Date },
    { models, commonQuerySelector }: IContext
  ) {
    const selector: any = { ...commonQuerySelector };
    if (date) {
      selector.date = date;
    }
    // return models.Templates.find({});
    return models.Templates.find(selector).sort({ order: 1, name: 1 });
  }
};

export default templateQueries;
