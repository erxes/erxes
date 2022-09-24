// import {
//   convertStringPropToFunction,
//   transformDimensions,
//   transformMeasures
// } from './utils';
// import { getService, getServices } from '@${tableSchema()}/api-utils/src/serviceDiscovery';

// asyncModule(async () => {
//   const services = await getServices();
//   const dynamicCubes = [];

//   for (const serviceName of services) {
//     const service = await getService(serviceName, true);
//     const meta = service.config?.meta || {};

//     if (meta && meta.dashboards) {
//       const schemas = meta.dashboards.schemas || [];

//       for (const schema of schemas) {
//         dynamicCubes.push(schema);
//       }
//     }
//   }

//   dynamicCubes.forEach(dynamicCube => {
//     const dimensions = transformDimensions(dynamicCube.dimensions);
//     const measures = transformMeasures(dynamicCube.measures);
//     console.log(dynamicCube.joins);

//     cube(dynamicCube.title, {
//       sql: dynamicCube.sql,
//       dimensions,
//       measures,
//       joins: dynamicCube.joins,
//       dataSource: `default`
//     });
//   });
// });
