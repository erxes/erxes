const fetchNode = require('node-fetch');
const crypto = require('crypto');
const strip = require('strip');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const { nanoid } = require('nanoid');

dotenv.config();

const { MONGO_URL, NODE_ENV } = process.env;

if (!MONGO_URL) {
    throw new Error(`Environment variable MONGO_URL not set.`);
}

let tempMongoUrl = MONGO_URL;
if (NODE_ENV === 'dev') {
    tempMongoUrl = `mongodb://127.0.0.1:27017/erxes?directConnection=true&retryWrites=true`
}
const client = new MongoClient(tempMongoUrl);
console.log('connecting db...');
let db;

// inbox

// call
let CallIntegrations;
let CallHistories;
let CallCustomers;
let Customers;
let Conversations;


const command = async () => {
    await client.connect();
    db = client.db();
    console.log('connected db');
    try {

        CallHistories = db.collection('calls_histories');
        CallIntegrations = db.collection('calls_integrations');
        CallCustomers = db.collection('calls_customers');
        Customers = db.collection('customers');
        Conversations = db.collection('conversations');

        const results = await CallIntegrations.find({
            'operators.gsForwardAgent': true,
        }).toArray();

        for (const result of results) {
            for (const operator of result.operators) {
                if (operator.gsForwardAgent) {

                    //last 3month
                    const startTime = getPureDate(new Date(), -7776000);
                    const endTime = getPureDate(new Date(), 10);

                    const incomingCdrData = await sendToGrandStream(
                        CallIntegrations,
                        {
                            path: 'api',
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            data: {
                                request: {
                                    action: 'cdrapi',
                                    format: 'json',
                                    callee: operator.gsUsername,
                                    startTime,
                                    endTime,
                                },
                            },
                            integrationId: result.inboxId,
                            retryCount: 1,
                            isConvertToJson: true,
                            isGetExtension: false,
                            isCronRunning: true,
                        },
                        '',
                    );
                    let cdrRoot =
                        incomingCdrData.response?.cdr_root || incomingCdrData.cdr_root;
                    await saveCdrData(cdrRoot, result, operator.userId);

                    const outgoingCdrData = await sendToGrandStream(
                        CallIntegrations,
                        {
                            path: 'api',
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            data: {
                                request: {
                                    action: 'cdrapi',
                                    format: 'json',
                                    caller: operator.gsUsername,
                                    startTime,
                                    endTime,
                                },
                            },
                            integrationId: result.inboxId,
                            retryCount: 1,
                            isConvertToJson: true,
                            isGetExtension: false,
                            isCronRunning: true,
                        },
                        '',
                    );
                    let outgoingCdrRoot =
                        outgoingCdrData.response?.cdr_root || outgoingCdrData.cdr_root;
                    await saveCdrData(outgoingCdrRoot, result, operator.userId);
                }
            }
        }

        console.log(`Os process finished at: ${new Date()}`);

        client.close();

        process.exit();
    } catch (e) {
        console.error(e);
    }
};

command();


const sendRequest = async (url, options) => {
    try {
        const response = await fetchNode(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
    } catch (error) {
        console.error('Error in sendRequest:', error);
        throw error;
    }
};

const getOrSetCallCookie = async (wsServer) => {
    const { CALL_API_USER, CALL_API_PASSWORD } = process.env;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    if (!CALL_API_USER || !CALL_API_PASSWORD) {
        throw new Error('Required API credentials missing!');
    }

    try {
        const challengeResponse = await sendRequest(`https://${wsServer}/api`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                request: {
                    action: 'challenge',
                    user: CALL_API_USER,
                    version: '1.0.20.23',
                },
            }),
        });

        const data = await challengeResponse.json();

        const { challenge } = data?.response;
        const hashedPassword = crypto
            .createHash('md5')
            .update(challenge + CALL_API_PASSWORD)
            .digest('hex');

        const loginResponse = await sendRequest(`https://${wsServer}/api`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                request: {
                    action: 'login',
                    user: CALL_API_USER,
                    token: hashedPassword,
                },
            }),
        });

        const loginData = await loginResponse.json();
        const { cookie } = loginData.response;

        return cookie;
    } catch (error) {
        console.error('Error in getOrSetCallCookie:', error);
        throw error;
    }
};

const sendToGrandStream = async (CallIntegrations, args, user) => {
    const {
        method,
        path,
        data,
        headers = {},
        integrationId,
        retryCount,
        isConvertToJson,
        isAddExtention,
        isGetExtension,
        isCronRunning,
        extentionNumber: extension,
    } = args;

    if (retryCount <= 0) {
        throw new Error('Retry limit exceeded.');
    }

    const integration = await CallIntegrations.findOne({
        inboxId: integrationId,
    });
    if (!integration) throw new Error('Integration not found');

    const { wsServer = '' } = integration;
    const operator = integration.operators.find((op) => op.userId === user?._id);
    const extentionNumber = isCronRunning
        ? extension
        : operator?.gsUsername || '1001';

    let cookie = await getOrSetCallCookie(wsServer);
    cookie = cookie?.toString();

    const requestOptions = {
        method,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...data,
            request: {
                ...data.request,
                cookie,
                ...(isAddExtention && { extension: extentionNumber }),
            },
        }),
    };

    try {
        const res = await sendRequest(
            `https://${wsServer}/${path}`,
            requestOptions,
        );

        if (isConvertToJson) {
            const response = await res.json();

            if (response.status === -6) {
                return await sendToGrandStream(
                    CallIntegrations,
                    {
                        path: 'api',
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        data,
                        integrationId,
                        retryCount: retryCount - 1,
                        isConvertToJson,
                        isGetExtension,
                    },
                    user,
                );
            }
            if (isGetExtension) {
                return { response, extentionNumber };
            }
            return response;
        }
        if (isGetExtension) {
            return { res, extentionNumber };
        }

        return res;
    } catch (error) {
        console.error('Error in sendToGrandStream:', error);
        throw error;
    }
};

const getPureDate = (date, updateTime) => {
    const ndate = new Date(date);

    const diffTimeZone = Number(process.env.TIMEZONE || 0) * 1000 * 60 * 60;

    const updatedDate = new Date(ndate.getTime() + updateTime * 1000);

    return new Date(updatedDate.getTime() + diffTimeZone);
};

const saveCdrData = async (cdrData, result, operatorUserId) => {
    try {
        for (const cdr of cdrData) {
            const history = createHistoryObject(cdr, result);
            await saveCallHistory(history);
            await processCustomerAndConversation(history, operatorUserId);
        }
    } catch (error) {
        console.error(`Error in saveCdrData: ${error.message}`);
    }
};

const createHistoryObject = (cdr, result) => {
    const callType = cdr.userfield === 'Outbound' ? 'outgoing' : 'incoming';
    const customerPhone = cdr.userfield === 'Inbound' ? cdr.src : cdr.dst;

    return {
        _id: parseInt(cdr.cdr),
        operatorPhone: result.phone,
        customerPhone,
        callDuration: parseInt(cdr.billsec),
        callStartTime: new Date(cdr.start),
        callEndTime: new Date(cdr.end),
        callType,
        callStatus: cdr.disposition === 'ANSWERED' ? 'connected' : 'missed',
        timeStamp: cdr.cdr ? parseInt(cdr.cdr) : 0,
        createdAt: cdr.start ? new Date(cdr.start) : new Date(),
        extentionNumber: cdr.userfield === 'Inbound' ? cdr.dst : cdr.src,
        inboxIntegrationId: result.inboxId,
        recordFiles: cdr.recordfiles,
        queueName: cdr.lastdata ? cdr.lastdata.split(',')[0] : '',
        conversationId: '',
    };
};

const cleanHtml = (content) => strip(content || '').substring(0, 100);

const saveCallHistory = async (history) => {
    try {
        await CallHistories.updateOne(
            { timeStamp: history.timeStamp },
            { $set: history },
            { upsert: true },
        );
    } catch (error) {
        throw new Error(`Failed to save call history: ${error.message}`);
    }
};

const processCustomerAndConversation = async (history, operatorUserId) => {
    CallCustomers = db.collection('calls_customers');

    let customer = await CallCustomers.findOne({
        primaryPhone: history.customerPhone,
    });
    if (!customer || !customer.erxesApiId) {
        customer = await getOrCreateCustomer({
            primaryPhone: history.customerPhone,
            inboxIntegrationId: history.inboxIntegrationId
        });
    }

    try {
        const CallHistory = await Conversations.findOne({ _id: history.timeStamp });
        if (!CallHistory) {
            const conversation = await Conversations.insertOne({
                _id: history.timeStamp.toString(),
                status: 'new',
                assignedUserId: operatorUserId,
                integrationId: history.inboxIntegrationId,
                customerId: customer?.erxesApiId,
                conversationId: history.timeStamp,
                updatedAt: history.callStartTime,
                createdAt: history.callStartTime,
                content: cleanHtml(history.callType || ''),
                messageCount: 0,
            });
            await CallHistories.updateOne(
                { timeStamp: history.timeStamp },
                { $set: { conversationId: conversation.insertedId } },
                { upsert: true },
            );
        }
    } catch (error) {
        await CallHistories.deleteOne({ timeStamp: history.timeStamp });
        console.log(`Failed to handle conversation: ${error.message}`);
    }
};

const getOrCreateCustomer = async (callAccount) => {
    const { inboxIntegrationId, primaryPhone } = callAccount;
    CallCustomers = db.collection('calls_customers');

    let callCustomer = await CallCustomers.findOne({
        primaryPhone,
        status: 'completed',
    });
    if (!callCustomer) {
        try {
            await CallCustomers.insertOne({
                inboxIntegrationId,
                erxesApiId: null,
                primaryPhone: primaryPhone,
                status: 'completed',
            });
            callCustomer = await CallCustomers.findOne({ primaryPhone: primaryPhone })
        } catch (e) {
            throw new Error(e);
        }

        try {
            let customer;
            if (primaryPhone) {
                customer = await Customers.findOne({ primaryPhone });
                if (!customer) {
                    await Customers.insertOne({
                        _id: nanoid(),
                        primaryPhone: primaryPhone,
                        isUser: true,
                        phones: [primaryPhone],
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                        state: 'lead',
                        searchText: primaryPhone.toString()
                    });

                }
            }
            customer = await Customers.findOne({ primaryPhone });


            await CallCustomers.updateOne(
                { _id: callCustomer._id },
                { $set: { erxesApiId: customer?._id?.toString() } },
            );

            return await CallCustomers.findOne({
                primaryPhone,
            });
        } catch (e) {
            console.log(e, 'customer error');
        }
    }
    return callCustomer;
};