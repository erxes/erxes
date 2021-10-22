import { IPOS } from "./types";

/**
 * pos
 */

export const posSChema = {
    _id: { pkey: true },
    name: { type: String, label: 'name' },
    description: { type: String, label: 'description' },
    userId: { type: String, optional: true, label: 'created by' },
    createdAt: { type: Date, label: 'Created at' },
    integrationId: { type: String },
    productDetails: { type: [String] },
    adminIds: { type: [String] },
    cashierIds: { type: [String] },
    waitingScreen: { type: Object },
    kioskMachine: { type: Object },
    kitchenScreen: { type: Object },
    formSectionTitle: { type: String },
    formIntegrationIds: { type: [String] }
};

class Pos {
    public static async getPosList(models) {
        return models.Pos.find().sort({ createdAt: 1 })
    }

    public static async getPos(models, query: any) {
        const pos = await models.Pos.findOne(query).lean();

        if (!pos) {
            throw new Error('POS not found');
        }
        return pos;
    }

    public static async posAdd(models, user, doc: IPOS) {
        try {
            const integration = await models.Integrations.createIntegration({ ...doc, kind: 'pos', isActive: true }, user._id);

            return models.Pos.create({
                userId: user._id,
                integrationId: integration._id,
                createdAt: new Date(),
                ...doc
            })
        } catch (e) {
            throw new Error(`Can not create POS integration. Error message: ${e.message}`)
        }

    }

    public static async posEdit(models, _id: string, doc: IPOS) {

        console.log(doc)

        const pos = await models.Pos.getPos(models, { _id });

        await models.Pos.updateOne({ _id },
            { $set: doc },
            { runValidators: true });

        await models.Integrations.updateOne({ _id: pos.integrationId },
            { $set: doc },
            { runValidators: true })

        return await models.Pos.findOne({ _id }).lean();;
    }

    public static async posRemove(models, _id: string) {
        const pos = await models.Pos.getPos(models, { _id });

        await models.Integrations.removeIntegration(pos.integrationId)

        return models.Pos.deleteOne({ _id });
    }
}

/**
 * productGroups
 */

export const productGroupSchema: any = {
    _id: { pkey: true },
    name: { type: String },
    description: { type: String },
    posId: { type: String },
    categoryIds: { type: [String], optional: true },
    excludedCategoryIds: { type: [String], optional: true },
    excludedProductIds: { type: [String], optional: true }
};

class ProductGroup {

    public static async groups(models, posId: string) {
        return models.ProductGroups.find({ posId }).lean();
    }

    public static async groupsAdd(models, user, name, description) {
        return models.ProductGroups.create({
            userId: user._id,
            name,
            description,
            createdAt: new Date()
        })
    }

    public static async groupsEdit(models, _id, doc) {
        const group = await models.ProductGroups.findOne({ _id }).lean();

        if (!group) {
            throw new Error('group not found');
        }

        await models.ProductGroups.updateOne({ _id }, {
            $set: doc
        });

        return await models.ProductGroups.findOne({ _id }).lean();;
    }

    public static async groupsRemove(models, _id: string) {
        return models.ProductGroups.deleteOne({ _id });
    }
}

export default [
    {
        name: 'Pos',
        schema: posSChema,
        klass: Pos
    },
    {
        name: 'ProductGroups',
        schema: productGroupSchema,
        klass: ProductGroup
    },
];