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

    public static async addPos(models, user, name, description) {
        return models.Pos.create({
            userId: user._id,
            name,
            description,
            createdAt: new Date()
        })
    }

    public static async editPos(models, { _id, name, description }: { _id: string, name: string, description: string }) {
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
}

export default [
    {
        name: 'Pos',
        schema: posSChema,
        klass: Pos
    },
];
