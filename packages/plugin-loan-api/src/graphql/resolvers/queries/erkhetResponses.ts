const erkhetResponseQueries = {
  /**
   * ErkhetResponses list
   */
  cpEbarimts: async (_root, params, { models }) => {
    const mainType = params.cpUserType || 'customer';
    if (mainType === 'customer') {
      const customer = await models.Customers.getWidgetCustomer({
        email: params.cpUserEmail,
        phone: params.cpUserPhone
      });

      const contractIds = await models.Conformities.savedConformity({
        mainType,
        mainTypeId: customer._id,
        relTypes: ['contract']
      });

      return models.ErkhetResponses.find({
        contractId: { $in: contractIds },
        isEbarimt: true,
        $and: [
          { createdAt: { $gte: new Date(params.year, 1, 1) } },
          { createdAt: { $lte: new Date(params.year, 12, 31) } }
        ]
      }).sort({ createdAt: -1 });
    }

    let company = await models.Companies.findOne({
      $or: [
        { emails: { $in: [params.cpUserEmail] } },
        { primaryEmail: params.cpUserEmail }
      ]
    }).lean();

    if (!company) {
      company = await models.Companies.findOne({
        $or: [
          { phones: { $in: [params.cpUserPhone] } },
          { primaryPhone: params.cpUserPhone }
        ]
      }).lean();
    }

    if (!company) {
      return [];
    }

    const contractIds = await models.Conformities.savedConformity({
      mainType,
      mainTypeId: company._id,
      relTypes: ['contract']
    });

    return models.Contracts.find({ _id: { $in: contractIds } }).sort({
      createdAt: -1
    });
  },

  cpEbarimtYears: async (_root, params, { models }) => {
    const mainType = params.cpUserType || 'customer';
    if (mainType === 'customer') {
      const customer = await models.Customers.getWidgetCustomer({
        email: params.cpUserEmail,
        phone: params.cpUserPhone
      });

      const contractIds = await models.Conformities.savedConformity({
        mainType,
        mainTypeId: customer._id,
        relTypes: ['contract']
      });

      const responses = await models.ErkhetResponses.find(
        { contractId: { $in: contractIds } },
        { createdAt: 1 }
      ).sort({ createdAt: 1 });

      const uniqueYears = [
        ...new Set(
          responses.map(item => new Date(item.createdAt).getFullYear())
        )
      ];
      return uniqueYears.map(item => ({ year: item }));
    }

    let company = await models.Companies.findOne({
      $or: [
        { emails: { $in: [params.cpUserEmail] } },
        { primaryEmail: params.cpUserEmail }
      ]
    }).lean();

    if (!company) {
      company = await models.Companies.findOne({
        $or: [
          { phones: { $in: [params.cpUserPhone] } },
          { primaryPhone: params.cpUserPhone }
        ]
      }).lean();
    }

    if (!company) {
      return [];
    }

    const contractIds = await models.Conformities.savedConformity({
      mainType,
      mainTypeId: company._id,
      relTypes: ['contract']
    });

    const responses = await models.Contracts.find({
      _id: { $in: contractIds }
    }).sort({ createdAt: -1 });

    const uniqueYears = [
      ...new Set(responses.map(item => new Date(item.createdAt).getFullYear()))
    ];
    return uniqueYears.map(item => ({ year: item }));
  }
};

export default erkhetResponseQueries;
