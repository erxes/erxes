import {
 checkPermission,
 requireLogin
} from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";
import { putCreateLog, putDeleteLog, putUpdateLog } from "../../../logUtils";
import { IAutoNumbering } from "../../../db/models/definitions/autoNumbering";


interface IAutoNumberingEdit extends IAutoNumbering {
 _id: string;
}


const AUTO_NUMBERING = "autoNumbering";


const autoNumberingMutations = {
 /**
  * Creates a new auto numbering configuration
  */
 async saveAutoNumbering(
   _root,
   { module, pattern, fractionalPart }: {
     module: string;
     pattern: string;
     fractionalPart: number;
   },
   { docModifier, models, subdomain, user }: IContext
 ) {
   // Check if configuration already exists for this module
   let autoNumbering = await models.AutoNumbering.findOne({ module });
  
   if (autoNumbering) {
     // Update existing configuration
     const updated = await models.AutoNumbering.updateAutoNumbering(autoNumbering._id, {
       pattern,
       fractionalPart
     });


     await putUpdateLog(
       models,
       subdomain,
       {
         type: AUTO_NUMBERING,
         object: autoNumbering,
         newData: { pattern, fractionalPart }
       },
       user
     );


     return updated;
   } else {
     // Create new configuration
     const doc = docModifier({ module, pattern, fractionalPart });
     const newAutoNumbering = await models.AutoNumbering.createAutoNumbering(doc);


     await putCreateLog(
       models,
       subdomain,
       { type: AUTO_NUMBERING, newData: newAutoNumbering, object: newAutoNumbering },
       user
     );


     return newAutoNumbering;
   }
 },


 /**
  * Generates the next auto number for a module
  */
 async generateAutoNumber(
   _root,
   { module }: { module: string },
   { models, subdomain, user }: IContext
 ) {
   const autoNumbering = await models.AutoNumbering.getAutoNumbering({ module });
  
   if (!autoNumbering) {
     throw new Error(`No auto numbering configuration found for module: ${module}`);
   }


   // Increment the counter and get the new number
   const updated = await models.AutoNumbering.findOneAndUpdate(
     { module },
     { $inc: { lastNumber: 1 } },
     { new: true }
   );


   if (!updated) {
     throw new Error(`Failed to generate auto number for module: ${module}`);
   }


   // Generate the formatted number
   const paddedNumber = String(updated.lastNumber).padStart(updated.fractionalPart || 4, "0");
   let generatedNumber = updated.pattern;
  
   // Replace common patterns
   const now = new Date();
   generatedNumber = generatedNumber
     .replace(/\{number\}/g, paddedNumber)
     .replace(/\{year\}/g, now.getFullYear().toString())
     .replace(/\{month\}/g, String(now.getMonth() + 1).padStart(2, '0'))
     .replace(/\{day\}/g, String(now.getDate()).padStart(2, '0'));


   // Log the generation activity
   await putUpdateLog(
     models,
     subdomain,
     {
       type: AUTO_NUMBERING,
       object: autoNumbering,
       newData: { lastNumber: updated.lastNumber },
       description: `Generated number: ${generatedNumber}`
     },
     user
   );


   return generatedNumber;
 },


 /**
  * Removes an auto numbering configuration
  */
 async autoNumberingRemove(
   _root,
   { _id }: { _id: string },
   { models, user, subdomain }: IContext
 ) {
   const autoNumbering = await models.AutoNumbering.getAutoNumbering(_id);
   const removed = await models.AutoNumbering.removeAutoNumbering(_id);


   await putDeleteLog(
     models,
     subdomain,
     { type: AUTO_NUMBERING, object: autoNumbering },
     user
   );


   return removed;
 },


 /**
  * Resets the counter for a module
  */
 async autoNumberingReset(
   _root,
   { _id, resetTo = 0 }: { _id: string; resetTo?: number },
   { models, subdomain, user }: IContext
 ) {
   const autoNumbering = await models.AutoNumbering.getAutoNumbering(_id);
  
   const updated = await models.AutoNumbering.updateAutoNumbering(_id, {
     lastNumber: resetTo
   });


   await putUpdateLog(
     models,
     subdomain,
     {
       type: AUTO_NUMBERING,
       object: autoNumbering,
       newData: { lastNumber: resetTo },
       description: `Reset counter to: ${resetTo}`
     },
     user
   );


   return updated;
 }
};


// Require login for generating numbers
requireLogin(autoNumberingMutations, "generateAutoNumber");


// Check permissions for management operations
// Update the permission checks at the bottom
checkPermission(autoNumberingMutations, "saveAutoNumbering", "manageAutoNumberings");
checkPermission(autoNumberingMutations, "autoNumberingRemove", "manageAutoNumberings");
checkPermission(autoNumberingMutations, "autoNumberingReset", "manageAutoNumberings");

// For generateAutoNumber, you might want to use generateAutoNumbers permission
requireLogin(autoNumberingMutations, "generateAutoNumber");


export default autoNumberingMutations;
