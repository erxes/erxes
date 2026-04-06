import { IContext } from '~/connectionResolvers';

const SEED_REGIONS = [
  {
    name: 'Ази, Номхон далайн бүс',
    countries: [
      'Австрали',
      'Азербайжан',
      'Афганистан',
      'Бангладеш',
      'Бутан',
      'Вьетнам',
      'Индонез',
      'Казахстан',
      'Камбож',
      'Киргиз',
      'Лаос',
      'Малайз',
      'Мальдив',
      'Сингапур',
      'Солонгос',
      'Тажикистан',
      'Тайланд',
      'Туркменистан',
      'Узбекистан',
      'Филиппин',
      'Хятад',
      'Шинэ Зеланд',
      'Шри Ланка',
      'Энэтхэг',
    ],
  },
  {
    name: 'АНУ, Канад, Япон',
    countries: ['АНУ', 'Канад', 'Япон'],
  },
  {
    name: 'Шенген бүс',
    countries: [
      'Австри',
      'Бельги',
      'Герман',
      'Грек',
      'Дани',
      'Исланд',
      'Испани',
      'Итали',
      'Латви',
      'Литва',
      'Лихтенштайн',
      'Люксембург',
      'Мальта',
      'Нидерланд',
      'Норвеги',
      'Польш',
      'Португал',
      'Унгар',
      'Финланд',
      'Франц',
      'Хорват',
      'Чех',
      'Швед',
      'Швейцар',
      'Эстони',
    ],
  },
  {
    name: 'Дэлхий нийт',
    countries: [
      'Албани',
      'Алжир',
      'Ангол',
      'Андорра',
      'Антигуа ба Барбуда',
      'Аргентин',
      'Армени',
      'Балба',
      'Барбадос',
      'Бахам',
      'Бахрейн',
      'Беларусь',
      'Белиз',
      'Бенин',
      'Болгар',
      'Боливи',
      'Босни-Херцеговин',
      'Ботсвана',
      'Бразил',
      'Британи',
      'Бруней',
      'Бурунди',
      'Вануату',
      'Ватикан',
      'Венесуэл',
      'Габон',
      'Гайана',
      'Гамби',
      'Гана',
      'Гватемал',
      'Гвиней',
      'Гвиней-Бисау',
      'Гренада',
      'Гүрж',
      'Доминик',
      'Доминикан',
      'Египет',
      'Жибути',
      'Замби',
      'Зимбабве',
      'Зүүн Тимор',
      'Иран',
      'Ирланд',
      'Йордан',
      'Кабо-Верде',
      'Катар',
      'Кени',
      'Кипр',
      'Кирибати',
      'Коморос',
      'Коста-Рика',
      'Куба',
      'Кувейт',
      'Лесото',
      'Либери',
      'Ливан',
      'Ливи',
      'Маврики',
      'Мавритани',
      'Мадагаскар',
      'Малави',
      'Марокко',
      'Маршаллын Арлууд',
      'Микронез',
      'Мозамбик',
      'Молдова',
      'Монако',
      'Монтенегро',
      'Намиби',
      'Науру',
      'Нижер',
      'Никарагуа',
      'Оман',
      'Африк',
      'Өмнөд Судан',
      'Палау',
      'Панам',
      'Папуа Шинэ Гвиней',
      'Парагвай',
      'Перу',
      'Руанда',
      'Румын',
      'Самоа',
      'Сан Марино',
      'Сан-Томе ба Принсипи',
      'Саудын Араб',
      'Сейшелийн арлууд',
      'Сенегал',
      'Сент-Винсент ба Гренадин',
      'Сент Кристофер ба Невис',
      'Сент Люсиа',
      'Серби',
      'Словак',
      'Словени',
      'Соломоны Арлууд',
      'Суринам',
      'Сьерра Леон',
      'Танзани',
      'Того',
      'Тонга',
      'Төв Африк',
      'Тринидад ба Тобаго',
      'Тувалу',
      'Тунис',
      'Турк',
      'Уганда',
      'Умард Македон',
      'Уругвай',
      'Фижи',
      'Хондурас',
      'Чад',
      'Чили',
      'Эквадор',
      'Экваторын Гвиней',
      'Эль Сальвадор',
      'Эмират',
      'Эритрей',
      'Эсватини',
      'Ямайка',
    ],
  },
];

export const regionMutations = {
  seedInsuranceRegions: Object.assign(
    async (_parent: undefined, _args: unknown, { models }: IContext) => {
      const results = [];

      for (const region of SEED_REGIONS) {
        const existing = await models.Region.findOne({ name: region.name });
        if (existing) {
          // Update countries if region already exists
          existing.countries = region.countries;
          await existing.save();
          results.push(existing);
        } else {
          const created = await models.Region.create(region);
          results.push(created);
        }
      }

      return results;
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  createInsuranceRegion: Object.assign(
    async (
      _parent: undefined,
      { name, countries }: { name: string; countries: string[] },
      { models }: IContext,
    ) => {
      // Remove these countries from any existing region
      await models.Region.updateMany(
        { countries: { $in: countries } },
        { $pull: { countries: { $in: countries } } },
      );

      return models.Region.create({ name, countries });
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  updateInsuranceRegion: Object.assign(
    async (
      _parent: undefined,
      {
        id,
        name,
        countries,
      }: { id: string; name?: string; countries?: string[] },
      { models }: IContext,
    ) => {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (countries !== undefined) {
        // Remove these countries from other regions
        await models.Region.updateMany(
          { _id: { $ne: id }, countries: { $in: countries } },
          { $pull: { countries: { $in: countries } } },
        );
        updateData.countries = countries;
      }

      return models.Region.findByIdAndUpdate(id, updateData, { new: true });
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  deleteInsuranceRegion: Object.assign(
    async (
      _parent: undefined,
      { id }: { id: string },
      { models }: IContext,
    ) => {
      await models.Region.findByIdAndDelete(id);
      return true;
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  addCountryToRegion: Object.assign(
    async (
      _parent: undefined,
      { regionId, country }: { regionId: string; country: string },
      { models }: IContext,
    ) => {
      // Remove from any existing region first
      await models.Region.updateMany(
        { countries: country },
        { $pull: { countries: country } },
      );

      return models.Region.findByIdAndUpdate(
        regionId,
        { $addToSet: { countries: country } },
        { new: true },
      );
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  removeCountryFromRegion: Object.assign(
    async (
      _parent: undefined,
      { regionId, country }: { regionId: string; country: string },
      { models }: IContext,
    ) => {
      return models.Region.findByIdAndUpdate(
        regionId,
        { $pull: { countries: country } },
        { new: true },
      );
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
