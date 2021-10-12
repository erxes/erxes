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
}

export default [
    {
        name: 'Pos',
        schema: posSChema,
        klass: Pos
    },
];
