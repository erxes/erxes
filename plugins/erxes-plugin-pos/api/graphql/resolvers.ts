const resolvers = [
    {
        type: 'Pos',
        field: 'integration',
        handler: (pos, { }, { models }) => {
            if (!pos.integrationId) {
                return null;
            }

            return models.Integrations.findOne({ _id: pos.integrationId });
        }
    },
    {
        type: 'Pos',
        field: 'user',
        handler: (pos, { }, { models }) => {
            if (!pos.userId) {
                return null;
            }

            return models.Users.findOne({ _id: pos.userId });
        }
    }
]

export default resolvers;