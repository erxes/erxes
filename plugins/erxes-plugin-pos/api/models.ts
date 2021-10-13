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

    public static async posAdd(models, user, name, description) {
        return models.Pos.create({
            userId: user._id,
            name,
            description,
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
 * posConfig
 */

export const posConfigSchema = {
    _id: { pkey: true },
    posId: { type: String },
    code: { type: String, unique: true },
    value: { type: Object }
};

class PosConfig {
    public static async configs(models, posId: string) {
        return models.PosConfigs.find({ posId }).lean();
    }

    public static async createOrUpdateConfig(models, {
        posId,
        code,
        value
    }: {
        posId: string;
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
];