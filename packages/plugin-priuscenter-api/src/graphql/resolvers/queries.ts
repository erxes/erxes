import { Ads, AdWishlists } from '../../models';
import { IContext } from '@erxes/api-utils/src/types';
import { paginate } from '@erxes/api-utils/src';

const adQueries = {
  ads(_root, args, _context: IContext) {
    const { perPage, page, title, description, authorName, priceRange } = args;

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

    if (page && perPage) {
      return paginate(Ads.find(selector).sort({ createdAt: -1 }), args);
    }

    return Ads.find(selector).sort({ order: 1, createdAt: -1 });
  },

  adDetail(_root, { _id }) {
    return Ads.findOne({ _id });
  },

  adsTotalCount(_root, _args, _context: IContext) {
    return Ads.find({}).countDocuments();
  },

  // Wishlist queries

  adWishlist(_root, args, { cpUser }) {
    if (!cpUser) {
      throw new Error('Login required');
    }
    return AdWishlists.findOne({ cpUserId: cpUser.userId });
  }
};

export default adQueries;
