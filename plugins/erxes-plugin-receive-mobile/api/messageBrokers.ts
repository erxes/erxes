import { regexSearchText, sendEmail } from 'erxes-api-utils'

const sendError = (message) => ({
  status: "error",
  errorMessage: message,
});

const sendSuccess = (data) => ({
  status: "success",
  data,
});

export default [
  {
    method: "RPCQueue",
    channel: "mobile_backend_rpc_to_api",
    handler: async (msg, { models }) => {
      const { action, data } = msg;
      let customer: any = null;
      let filter = {};
      let car: any = null;
      let dealIdsOfCustomer = [];

      try {
        switch (action) {
          case "createCustomer":
            customer = await models.Customers.getWidgetCustomer({
              email: data.email,
              phone: data.phoneNumber,
            });

            const doc = {
              email: data.email,
              phone: data.phoneNumber,
              deviceToken: data.deviceToken,
              firstName: data.firstName,
              lastName: data.lastName,
              description: data.address,
              integrationId: data.integrationId,
            };

            customer = customer
              ? await models.Customers.updateMessengerCustomer({
                _id: customer._id,
                doc,
              })
              : await models.Customers.createMessengerCustomer({ doc });

            return sendSuccess(customer);

          case "getUserAdditionInfo":
            customer = await models.Customers.getWidgetCustomer({
              email: data.user.email,
              phone: data.user.phoneNumber,
            });

            if (!customer) {
              return sendError("User has not customer");
            }
            const loyalty = await models.Loyalties.getLoyaltyValue(models, customer._id);

            filter = {};
            dealIdsOfCustomer = await models.Conformities.savedConformity({
              mainType: "customer",
              mainTypeId: customer._id,
              relTypes: ["deal"],
            });

            if (data.carId) {
              const dealIdsOfCar = await models.Conformities.savedConformity({
                mainType: "car",
                mainTypeId: data.carId,
                relTypes: ["deal"],
              });
              filter["_id"] = { $in: dealIdsOfCar };
            }

            const wStageIds = await models.Stages.find(
              { probability: "Won" },
              { _id: 1 }
            );
            filter["stageId"] = { $in: wStageIds };

            const dealCount = await models.Deals.find({
              $and: [{ _id: { $in: dealIdsOfCustomer } }, filter],
            }).countDocuments();

            return sendSuccess({ loyalty, dealCount });

          case "createCar":
            try {
              car = await models.Cars.createCar(models, { ...data });
              customer = await models.Customers.getWidgetCustomer({
                email: data.user.email,
                phone: data.user.phoneNumber,
              });
              if (!customer) {
                customer = await models.Customers.createMessengerCustomer({
                  doc: {
                    email: data.user.email,
                    phone: data.user.phoneNumber,
                    deviceToken: data.deviceToken,
                    integrationId: data.integrationId,
                  },
                });
              }
              await models.Conformities.addConformity({
                mainType: "customer",
                mainTypeId: customer._id,
                relType: "car",
                relTypeId: car._id,
              });
            } catch (e) {
              return sendError(e.message);
            }

            return sendSuccess(car);

          case "filterCars":
            customer = await models.Customers.getWidgetCustomer({
              email: data.user.email,
              phone: data.user.phoneNumber,
            });

            if (!customer) {
              return sendError("User has not customer");
            }
            const carIds = await models.Conformities.savedConformity({
              mainType: "customer",
              mainTypeId: customer._id,
              relTypes: ["car"],
            });

            filter = {};

            if (data.ids) {
              filter["_id"] = { $in: data.ids };
            }

            if (data.searchValue) {
              filter["searchText"] = {
                $in: [new RegExp(`.*${data.searchValue}.*`, "i")],
              };
            }

            if (data.categoryId) {
              filter["categoryId"] = data.categoryId;
            }

            return sendSuccess(
              await models.Cars.aggregate([
                { $match: { $and: [{ _id: { $in: carIds } }, filter] } },
                {
                  $lookup: {
                    from: "car_categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                  },
                },
                { $unwind: "$category" },
              ])
            );

          case "getCar":
            car = await models.Cars.findOne({ _id: data._id });

            if (!car) {
              return sendError("Car not found");
            }

            return sendSuccess({
              car,
              category: await models.CarCategories.findOne({
                _id: car.categoryId,
              }),
            });

          case "filterCarCategories":
            filter = {};
            filter["parentId"] = data.parentId || "";

            if (data.searchValue) {
              filter["name"] = new RegExp(`.*${data.searchValue}.*`, "i");
            }

            return sendSuccess(
              await models.CarCategories.aggregate([
                { $match: filter },
                {
                  $lookup: {
                    from: "car_categories",
                    localField: "_id",
                    foreignField: "parentId",
                    as: "childs",
                  },
                },
                {
                  $project: {
                    code: 1,
                    name: 1,
                    description: 1,
                    parentId: 1,
                    order: 1,
                    childCount: { $size: "$childs" },
                  },
                },
                { $sort: { order: 1 } },
              ])
            );

          case "getProduct":
            const product = await models.Products.findOne({
              _id: data.productId,
            });

            if (!product) {
              return sendError("Product not found");
            }
            return sendSuccess({
              product,
              category: await models.ProductCategories.findOne({
                _id: product.categoryId,
              }),
            });

          case "filterProductCategories":
            filter = {};
            filter["parentId"] = data.parentId;

            if (data.searchValue) {
              filter["name"] = new RegExp(`.*${data.searchValue}.*`, "i");
            }

            return sendSuccess(
              await models.ProductCategories.aggregate([
                { $match: filter },
                {
                  $lookup: {
                    from: "product_categories",
                    localField: "_id",
                    foreignField: "parentId",
                    as: "childs",
                  },
                },
                {
                  $project: {
                    code: 1,
                    name: 1,
                    description: 1,
                    parentId: 1,
                    order: 1,
                    childCount: { $size: "$childs" },
                  },
                },
                { $sort: { order: 1 } },
              ])
            );

          case "filterProducts":
            const {
              page = 0,
              perPage = 0,
              ids,
              type,
              searchValue,
              categoryId,
            } = data;
            if (ids) {
              filter["_id"] = { $in: ids };
            }

            if (type) {
              filter["type"] = type;
            }

            if (searchValue) {
              const fields = [
                { name: { $in: [new RegExp(`.*${searchValue}.*`, "i")] } },
                { code: { $in: [new RegExp(`.*${searchValue}.*`, "i")] } },
              ];

              filter["$or"] = fields;
            }

            if (categoryId) {
              filter["categoryId"] = categoryId;
            }

            const _page = Number(page || "1");
            const _limit = Number(perPage || "20");

            return sendSuccess(
              await models.Products.aggregate([
                { $match: filter },
                {
                  $lookup: {
                    from: "product_categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                  },
                },
                { $unwind: "$category" },
                { $skip: (_page - 1) * _limit },
                { $limit: _limit },
              ])
            );

          case "filterDeals":
            customer = await models.Customers.getWidgetCustomer({
              email: data.user.email,
              phone: data.user.phoneNumber,
            });

            if (!customer) {
              return sendError("User has not customer");
            }

            filter = {};
            dealIdsOfCustomer = await models.Conformities.savedConformity({
              mainType: "customer",
              mainTypeId: customer._id,
              relTypes: ["deal"],
            });

            if (data.carId) {
              const dealIdsOfCar = await models.Conformities.savedConformity({
                mainType: "car",
                mainTypeId: data.carId,
                relTypes: ["deal"],
              });
              filter["_id"] = { $in: dealIdsOfCar };
            }

            if (data.search) {
              Object.assign(filter, regexSearchText(data.search));
            }

            const stageFilter =
              data.kind === "Won"
                ? { probability: "Won" }
                : { probability: { $ne: "Won" } };
            const wonStageIds = await models.Stages.find(stageFilter, {
              _id: 1,
            });
            filter["stageId"] = { $in: wonStageIds };

            const deals = await models.Deals.find({
              $and: [{ _id: { $in: dealIdsOfCustomer } }, filter],
            });

            const stageIds = deals.map((deal) => deal.stageId);
            const stages = await models.Stages.find(
              { _id: { $in: stageIds } },
              { _id: 1, name: 1, pipelineId: 1 }
            );
            const pipelineIds = stages.map((stage) => stage.pipelineId);
            const pipelines = await models.Pipelines.find(
              { _id: { $in: pipelineIds } },
              { _id: 1, name: 1, boardId: 1 }
            );
            const boardIds = pipelines.map((pipeline) => pipeline.boardId);
            const boards = await models.Boards.find(
              { _id: { $in: boardIds } },
              { _id: 1, name: 1 }
            );

            const copyDeals: any[] = [...deals];
            const extDeals: any[] = [];

            for (const deal of copyDeals) {
              const stage = stages.find((stage) => stage._id === deal.stageId);
              const pipeline = pipelines.find(
                (pipeline) => pipeline._id === stage?.pipelineId
              );

              extDeals.push({
                ...deal._doc,
                stage: stage?.name,
                pipeline: pipeline?.name,
                board: boards.find((board) => board._id === pipeline?.boardId)
                  ?.name,
              });
            }

            return sendSuccess(extDeals);

          case "getDeal":
            return sendSuccess(await models.Deals.findOne({ _id: data._id }));

          case "createDeal":
            customer = await models.Customers.getWidgetCustomer({
              email: data.user.email,
              phone: data.user.phoneNumber,
            });

            if (!customer) {
              return sendError("User has not customer");
            }

            const deal = await models.Deals.createDeal({ ...data.dealDoc });

            await models.Conformities.addConformity({
              mainType: "deal",
              mainTypeId: deal._id,
              relType: "customer",
              relTypeId: customer._id,
            });

            if (data.carId) {
              await models.Conformities.addConformity({
                mainType: "deal",
                mainTypeId: deal._id,
                relType: "car",
                relTypeId: data.carId,
              });
            } else {
              const carIds = await models.Conformities.savedConformity({
                mainType: "customer",
                mainTypeId: customer._id,
                relTypes: ["car"],
              });
              if (carIds.length > 0) {
                await models.Conformities.addConformity({
                  mainType: "deal",
                  mainTypeId: deal._id,
                  relType: "car",
                  relTypeId: carIds[0],
                });
              }
            }

            return sendSuccess(deal);

          case "getKnowledgeBaseTopicDetail":
            return sendSuccess(
              await models.KnowledgeBaseTopics.getTopic(data._id)
            );

          case "getKnowlegeBaseForCatIds":
            return sendSuccess({
              topics: await models.KnowledgeBaseTopics.find({
                categoryIds: { $in: data.categoryIds },
              }),
              categories: await models.KnowledgeBaseCategories.find({
                _id: { $in: data.categoryIds },
              }),
            });

          case "filterKnowledgeBaseCategories":
            const topic = await models.KnowledgeBaseTopics.getTopic(
              data.topicId
            );

            const knowledgeBaseCategories = await models.KnowledgeBaseCategories.find(
              {
                _id: { $in: topic.categoryIds },
              }
            );

            // return sendSuccess(await paginate(knowledgeBaseCategories, { ...data }));
            return sendSuccess(knowledgeBaseCategories);

          case "getKnowledgeBaseCategory":
            return sendSuccess(
              await models.KnowledgeBaseCategories.getCategory(data)
            );

          case "filterKnowledgeBaseArticles":
            const category = await models.KnowledgeBaseCategories.getCategory(
              data.categoryId
            );

            const articles = await models.KnowledgeBaseArticles.find({
              _id: { $in: category.articleIds },
              status: "publish",
            }).sort({
              createdAt: -1,
            });

            // return sendSuccess(await paginate(articles, { ...data }));
            return sendSuccess(articles);

          case "getKnowledgeBaseArticle":
            return sendSuccess(
              await models.KnowledgeBaseArticles.getArticle(data._id)
            );
        }
      } catch (e) {
        sendError(e.message);
      }
    },
  },
  {
    method: "Queue",
    channel: "mobile_backend_to_api",
    handler: async (msg, { models, memoryStorage }) => {
      const { action, data } = msg;
      let customer: any = null;

      switch (action) {
        case 'sendEmail':
          return sendSuccess(await sendEmail(models, memoryStorage, process, {
            toEmails: [data.email],
            title: data.title,
            template: {
              name: data.title,
              data: {
                content: data.content,
              },
            }
          }));

        case "updateCar":
          return sendSuccess(
            await models.Cars.updateCar(models, data._id, { ...data })
          );

        case "removeCars":
          return sendSuccess(await models.Cars.removeCars(models, data.carIds));

        case "addLoyalty":
          customer = await models.Customers.getWidgetCustomer({
            email: data.user.email,
            phone: data.user.phoneNumber,
          });

          if (!customer) {
            customer = await models.Customers.createMessengerCustomer({
              doc: {
                email: data.user.email,
                phone: data.user.phoneNumber,
                deviceToken: data.deviceToken,
                integrationId: data.integrationId,
              },
            });
          }

          await models.Loyalties.addLoyalty(models, customer, data.loyalty);
      }
    },
  },
];
