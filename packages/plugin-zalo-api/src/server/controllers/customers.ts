import { IModels } from "../../models";
import { sendInboxMessage } from "../brokers";
import { debug } from "../../configs";
import { zaloGet } from "../../zalo";
const querystring = require("querystring");

export const createOrUpdateCustomer = async (
    models: IModels,
    subdomain: any,
    data: any = {}
) => {
    const integrationId = data?.integrationId;
    const oa_id = data?.oa_id;
    const checkFollower = data?.checkFollower;

    // delete data.integrationId;
    delete data.oa_id;
    delete data.checkFollower;

    let hasData = Object.keys(data).length > 1;

    let customer = await models.Customers.findOne({
        userId: data.userId,
    });

    let firstName = data?.isAnonymous ? "Ẩn danh" : "";

    if (oa_id && !data?.isAnonymous) {
        const mayBeFollower =
            checkFollower && !customer?.isFollower
                ? await isFollowedUser(data.userId, { models, oa_id })
                : false;

        const zaloUser: any = await zaloGet(
            `conversation?data=${JSON.stringify({
                user_id: data.userId,
                offset: 0,
                count: 1,
            })}`,
            { models, oa_id }
        );

        let {
            src,
            from_id,
            to_id,
            from_display_name,
            to_display_name,
            from_avatar,
            to_avatar,
        } = zaloUser?.data?.[0];

        const userId = src ? from_id : to_id;
        firstName = src ? from_display_name : to_display_name;
        const avatar = src ? from_avatar : to_avatar;

        data = {
            ...data,
            firstName,
            integrationId,
            profilePic: avatar,
            isFollower: mayBeFollower,
        };
    }

    data = {
        ...data,
        firstName,
    };

    if (customer) {
        customer.isFollower = data.isFollower;
        customer.save();
        return customer;
    }

    try {
        customer = await models.Customers.create(data);
    } catch (e) {
        throw new Error(
            e.message.includes("duplicate")
                ? "Concurrent request: customer duplication"
                : e
        );
    }

    // save on api
    try {
        const apiCustomerResponse = await sendInboxMessage({
            subdomain,
            action: "integrations.receive",
            data: {
                action: "get-create-update-customer",
                payload: JSON.stringify({
                    ...data,
                    avatar: data?.profilePic,
                    isUser: true,
                }),
            },
            isRPC: true,
        });

        customer.erxesApiId = apiCustomerResponse._id;
        await customer.save();
    } catch (e) {
        await models.Customers.deleteOne({ _id: customer._id });
        debug.error(`apiCustomerResponse error: ${e.message}`);
    }

    return customer;
};

export const isFollowedUser = async (user_id, config) => {
    const mayBeFollower = await zaloGet(
        `getprofile?data=${JSON.stringify({ user_id })}`,
        config
    );
    return mayBeFollower.error === 0;
};
