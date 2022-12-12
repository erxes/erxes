import { Ads } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';

const adQueries = {
  ads(_root, args, _context: IContext) {
    const { skip, limit, title, description, authorName, priceRange } = args;

    const selector: any = {};

    const exactFields = [
      'type',
      'mark',
      'model',
      'color',
      'state',
      'authorPhone',
      'authorEmail',
      'manufacturedYear',
      'cpUserId'
    ];

    for (const field of exactFields) {
      if (args[field]) {
        selector[field] = args[field];
      }
    }

    const regexFilter = value => {
      return {
        $regex: `.*${value.trim()}.*`,
        $options: 'i'
      };
    };

    if (authorName) {
      selector.authorName = regexFilter(authorName);
    }

    if (title) {
      selector.title = regexFilter(title);
    }

    if (description) {
      selector.description = regexFilter(description);
    }

    if (priceRange) {
      let [from, to] = priceRange.split('-');

      if (from && to) {
        from = parseFloat(from);
        to = parseFloat(to);

        selector.price = {
          $gte: from,
          $lte: to
        };
      }
    }

    return Ads.find(selector)
      .skip(skip || 0)
      .limit(limit || 20);
  },

  adDetail(_root, { _id }) {
    return Ads.findOne({ _id });
  },

  adsTotalCount(_root, _args, _context: IContext) {
    return Ads.find({}).countDocuments();
  }
};

export default adQueries;
