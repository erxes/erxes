// import { IWork } from './../models/definitions/works';
// import { IModels } from '../connectionResolver';
// import { IFlowDocument } from '../models/definitions/flows';
// import {
//   findLastJob,
//   getBeforeJobs,
//   getJobRefers,
//   getLeftJobs,
//   initDocOverallWork,
//   initDocWork,
//   overallWorksAdd,
//   overallWorksUpdate,
//   recursiveCatchBeforeJobs,
//   worksAdd
// } from './utils';
// import { sendSalesplansMessage } from '../messageBroker';

// // export const rf = (data, list) => {
// export const rf = async (models: IModels, subdomain: string, params) => {
//   let descriptionForWork = '';
//   const inputData = params.data;
//   const { branchId, departmentId, interval, salesLogId } = inputData;
//   const { intervals } = interval;

//   let intervalId = 'intervalId';

//   for (const intervalData of intervals) {
//     const { productId, count, label } = intervalData;
//     intervalId = label;
//     const flowValidation = '';
//     const status = 'active';
//     const filter = { productId, flowValidation, status };
//     const flow = (await models.Flows.findOne(filter)) || ({} as IFlowDocument);
//     const jobRefers = await models.JobRefers.find({
//       status: { $in: ['active', null] }
//     });

//     if (Object.keys(flow).length > 0) {
//       const jobs = flow.jobs || [];

//       const response = findLastJob(
//         jobs,
//         jobRefers,
//         productId,
//         branchId,
//         departmentId
//       );

//       const { flowStatus, lastJob } = response;
//       const leftJobs = getLeftJobs(jobs, [lastJob?.id || '']);

//       if (Object.keys(lastJob || {}).length > 0 && flowStatus) {
//         const lastJobRefer = getJobRefers(
//           [lastJob?.config.jobReferId || ''],
//           jobRefers
//         );

//         const doc: IWork = await initDocWork(
//           flow,
//           lastJobRefer[0],
//           count,
//           subdomain,
//           lastJob,
//           intervalId
//         );

//         await worksAdd(doc, models);

//         // filtering beforeJobs of lastJob on flow
//         const beforeJobs = getBeforeJobs(leftJobs, lastJob?.id || '');
//         const level = 2;
//         const recursiveJobs = beforeJobs;

//         const responseleftjobs = await recursiveCatchBeforeJobs(
//           recursiveJobs,
//           leftJobs,
//           level,
//           {
//             flow,
//             count,
//             branchId,
//             departmentId,
//             jobRefers,
//             models
//           },
//           intervalId,
//           subdomain
//         );

//         for await (const responseleftjob of responseleftjobs) {
//           const leftJobRefer = getJobRefers(
//             [responseleftjob.jobReferId || ''],
//             jobRefers
//           );

//           const docLeft: IWork = await initDocWork(
//             flow,
//             leftJobRefer[0],
//             count,
//             subdomain,
//             responseleftjob,
//             intervalId
//           );

//           await worksAdd(docLeft, models);
//         }
//       } else {
//         descriptionForWork = `last job not defined on flow / ${flow.name} / `;
//       }
//     } else {
//       descriptionForWork = 'not found that case: ' + filter;
//     }
//   }

//   // OverallWorks
//   const works = await models.Works.find({ status: 'new', intervalId });
//   if (works.length > 0) {
//     for (const work of works) {
//       const {
//         jobId,
//         outBranchId,
//         outDepartmentId,
//         inBranchId,
//         inDepartmentId
//       } = work;

//       const filter = {
//         jobId,
//         outBranchId,
//         outDepartmentId,
//         inBranchId,
//         inDepartmentId,
//         intervalId
//       };

//       const overallWork = await models.OverallWorks.findOne(filter);

//       if (overallWork) {
//         await overallWorksUpdate(overallWork, work, models);
//       } else {
//         const doc = initDocOverallWork(work);
//         await overallWorksAdd(doc, models);
//       }
//     }

//     await models.Works.updateMany(
//       { status: 'new', intervalId },
//       { $set: { status: 'done' } }
//     );
//   }

//   try {
//     sendSalesplansMessage({
//       subdomain,
//       action: 'saleslogs.statusUpdate',
//       data: {
//         _id: salesLogId,
//         status: 'published'
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }

//   return inputData;
// };
