import { checkPermission } from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";


const autoNumberingQueries = {
 /**
  * Get all auto numbering configurations
  */
 async autoNumberings(
   _root,
   _args,
   { models }: IContext
 ) {
   return models.AutoNumbering.find({}).sort({ createdAt: -1 });
 },


 /**
  * Get auto numbering configuration by module
  */
 async autoNumbering(
   _root,
   { module, _id }: { module?: string; _id?: string },
   { models }: IContext
 ) {
   if (_id) {
     return models.AutoNumbering.getAutoNumbering(_id);
   }
  
   if (module) {
     return models.AutoNumbering.findOne({ module });
   }
  
   throw new Error("Either module or _id parameter is required");
 },


 /**
  * Get auto numbering configurations by type
  */
 async autoNumberingsByModule(
   _root,
   { modules }: { modules: string[] },
   { models }: IContext
 ) {
   return models.AutoNumbering.find({
     module: { $in: modules }
   }).sort({ module: 1 });
 },


 /**
  * Preview the next number without incrementing
  */
 async autoNumberingPreview(
   _root,
   { module }: { module: string },
   { models }: IContext
 ) {
   const autoNumbering = await models.AutoNumbering.findOne({ module });
  
   if (!autoNumbering) {
     throw new Error(`No auto numbering configuration found for module: ${module}`);
   }


   // Generate preview without incrementing
   const nextNumber = autoNumbering.lastNumber + 1;
   const paddedNumber = String(nextNumber).padStart(autoNumbering.fractionalPart || 4, "0");
  
   let previewNumber = autoNumbering.pattern;
   const now = new Date();
  
   previewNumber = previewNumber
     .replace(/\{number\}/g, paddedNumber)
     .replace(/\{year\}/g, now.getFullYear().toString())
     .replace(/\{month\}/g, String(now.getMonth() + 1).padStart(2, '0'))
     .replace(/\{day\}/g, String(now.getDate()).padStart(2, '0'));


   return {
     module: autoNumbering.module,
     currentNumber: autoNumbering.lastNumber,
     nextNumber,
     previewNumber,
     pattern: autoNumbering.pattern
   };
 }
};


// Check permissions for viewing auto numbering configurations
checkPermission(autoNumberingQueries, "autoNumberings", "showAutoNumberings");
checkPermission(autoNumberingQueries, "autoNumbering", "showAutoNumberings");
checkPermission(autoNumberingQueries, "autoNumberingsByModule", "showAutoNumberings");
checkPermission(autoNumberingQueries, "autoNumberingPreview", "showAutoNumberings");


export default autoNumberingQueries;
