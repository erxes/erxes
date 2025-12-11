//packages/core/src/data/resolvers/autoNumbering.ts
import { IContext } from "../../connectionResolver";
import { IAutoNumberingDocument } from "../../db/models/definitions/autoNumbering";


const autoNumbering = {
 /**
  * Federation resolver reference
  */
 async __resolveReference({ _id }, { models }: IContext) {
   return models.AutoNumbering.findOne({ _id });
 },


 /**
  * Get the current formatted number without incrementing
  */
 async currentFormattedNumber(
   autoNumberingDoc: IAutoNumberingDocument,
   _args,
   { models }: IContext
 ) {
   const paddedNumber = String(autoNumberingDoc.lastNumber).padStart(
     autoNumberingDoc.fractionalPart || 4,
     "0"
   );
  
   let formattedNumber = autoNumberingDoc.pattern;
   const now = new Date();
  
   formattedNumber = formattedNumber
     .replace(/\{number\}/g, paddedNumber)
     .replace(/\{year\}/g, now.getFullYear().toString())
     .replace(/\{month\}/g, String(now.getMonth() + 1).padStart(2, '0'))
     .replace(/\{day\}/g, String(now.getDate()).padStart(2, '0'));


   return formattedNumber;
 },


 /**
  * Get the next formatted number without incrementing
  */
 async nextFormattedNumber(
   autoNumberingDoc: IAutoNumberingDocument,
   _args,
   { models }: IContext
 ) {
   const nextNumber = autoNumberingDoc.lastNumber + 1;
   const paddedNumber = String(nextNumber).padStart(
     autoNumberingDoc.fractionalPart || 4,
     "0"
   );
  
   let formattedNumber = autoNumberingDoc.pattern;
   const now = new Date();
  
   formattedNumber = formattedNumber
     .replace(/\{number\}/g, paddedNumber)
     .replace(/\{year\}/g, now.getFullYear().toString())
     .replace(/\{month\}/g, String(now.getMonth() + 1).padStart(2, '0'))
     .replace(/\{day\}/g, String(now.getDate()).padStart(2, '0'));


   return formattedNumber;
 },


 /**
  * Check if the pattern is valid
  */
 async isValidPattern(
   autoNumberingDoc: IAutoNumberingDocument,
   _args,
   { models }: IContext
 ) {
   const pattern = autoNumberingDoc.pattern;
  
   // Basic pattern validation
   const validTokens = ['{number}', '{year}', '{month}', '{day}'];
   const hasValidToken = validTokens.some(token => pattern.includes(token));
  
   return hasValidToken && pattern.length > 0;
 },


 /**
  * Get usage statistics
  */
 async usageCount(
   autoNumberingDoc: IAutoNumberingDocument,
   _args,
   { models }: IContext
 ) {
   // Return the current last number as usage count
   return autoNumberingDoc.lastNumber || 0;
 }
};


export default autoNumbering;
