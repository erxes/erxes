import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src';

const directionsQuery = {
  directions: async (
    _root,
    {
      searchValue,
      page,
      perPage
    }: { searchValue?: string; page?: number; perPage?: number },
    { models }: IContext
  ) => {
    const filter: any = {};

    if (searchValue) {
      filter.searchText = { $in: [new RegExp(`.*${searchValue}.*`, 'i')] };
    }

    // const cities = CITIES;

    // const data: any[] = [];

    // for (const city of cities) {
    //   const obj: any = city;

    //   if (obj.city_mn) {
    //     continue;
    //   }

    //   obj.city_mn = translit(city.city);
    //   obj._id = `${city.province}_${city.city}`;
    //   data.push(obj);
    // }

    // data.sort(function(a, b) {
    //   var keyA = a.province,
    //     keyB = b.province;
    //   // Compare the 2 dates
    //   if (keyA < keyB) return -1;
    //   if (keyA > keyB) return 1;
    //   return 0;
    // });

    // console.log(data);
    // let jsondata = JSON.stringify(data);
    // fs.writeFileSync(
    //   "/home/cook/work/federation/erxes/packages/plugin-tumentech-api/src/graphql/resolvers/queries/location.json",
    //   jsondata
    // );

    return paginate(models.Directions.find(filter).lean(), {
      page: page || 1,
      perPage: perPage || 20
    });
  }
};

export default directionsQuery;
