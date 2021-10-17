/**
 * pos
 */

export const posSChema = {
    _id: { pkey: true },
    name: { type: String, label: 'name' },
    description: { type: String, label: 'description' },
    userId: { type: String, optional: true, label: 'created by' },
    createdAt: { type: Date, label: 'Created at' },
};

class Pos {
    public static async getPosList(models) {
        return models.Pos.find().sort({ createdAt: 1 })
    }

    public static async posAdd(models, user, name, brandId) {

        const doc = { name, brandId, kind: 'pos' };
        const integration = await models.Integrations.createIntegration(doc, user._id);
        console.log('integration', integration)

        return models.Pos.create({
            userId: user._id,
            name,
            createdAt: new Date()
        })
    }

    public static async posEdit(models, { _id, name, description }: { _id: string, name: string, description: string }) {
        const pos = await models.Pos.findOne({ _id }).lean();

        if (!pos) {
            throw new Error('pos not found');
        }

        await models.Pos.update({ _id }, {
            $set: {
                name,
                description
            }
        });

        return await models.Pos.findOne({ _id }).lean();;
    }

    public static async posRemove(models, _id: string) {
        return models.Pos.deleteOne({ _id });
    }
}

/**
 * productGroups
 */

export const productGroupSchema: any = {
    name: { type: String },
    description: { type: String },
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

    public static async groupsEdit(models, { _id, name, description }: { _id: string, name: string, description: string }) {
        const group = await models.ProductGroups.findOne({ _id }).lean();

        if (!group) {
            throw new Error('group not found');
        }

        await models.ProductGroups.update({ _id }, {
            $set: {
                name,
                description
            }
        });

        return await models.ProductGroups.findOne({ _id }).lean();;
    }

    public static async groupsRemove(models, _id: string) {
        return models.ProductGroups.deleteOne({ _id });
    }
}


/**
 * posConfig
 */

export const posConfigSchema: any = {
    _id: { pkey: true },
    integrationId: { type: String },
    productDetails: { type: [String] },
    productGroupIds: { type: [String] }
};

class PosConfig {

    public static async configs(models, integrationId: string) {
        return models.PosConfigs.findOne({ integrationId }).lean();
    }

    public static async createOrUpdateConfig(models, posId, {
        code,
        value
    }: {
        code: string;
        value: any;
    }) {
        const obj = await models.PosConfigs.findOne({ posId, code });

        if (obj) {
            await models.PosConfigs.updateOne({ _id: obj._id }, { $set: { value } });

            return models.PosConfigs.findOne({ _id: obj._id });
        }

        return models.PosConfigs.create({ code, value, posId });
    }
}

export default [
    {
        name: 'Pos',
        schema: posSChema,
        klass: Pos
    },
    {
        name: 'PosConfigs',
        schema: posConfigSchema,
        klass: PosConfig
    },
    {
        name: 'ProductGroups',
        schema: productGroupSchema,
        klass: ProductGroup
    },
];