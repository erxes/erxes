import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@erxes/ui";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "@erxes/ui/src/utils";
import Header from "@erxes/ui/src/layout/components/Header";
import { Alert } from "@erxes/ui/src/utils";


// Mock mutation function - replace with your actual mutation
const saveMutation = ({ variables }) => {
 return new Promise((resolve, reject) => {
   // Simulate API call
   setTimeout(() => {
     if (Math.random() > 0.5) {
       resolve({ data: { autoNumberingAdd: { _id: "123" } } });
     } else {
       reject(new Error("Failed to save auto numbering"));
     }
   }, 1000);
 });
};


const AutoNumberingForm: React.FC = () => {
 const [module, setModule] = useState("customers");
 const [pattern, setPattern] = useState("[year]/{number}");
 const [fractionalPart, setFractionalPart] = useState(8);
 const [currentId] = useState<string | null>(null);
 

 const navigate = useNavigate();


 const handleSave = () => {
   saveMutation({
     variables: {
       _id: currentId,
       module,
       pattern,
       fractionalPart,
     },
   })
     .then(() => {
       Alert.success("Auto Numbering saved successfully");
       navigate("/settings/auto-numbering");
     })
     .catch((error: unknown) => {
       const errMsg =
         typeof error === "string"
           ? error
           : error &&
             typeof error === "object" &&
             "message" in error
           ? (error as { message: string }).message
           : "Unknown error";


       Alert.error(errMsg);
     });
 };


 const header = (
   <Header
     title={__(currentId ? "Edit Auto Numbering" : "New Auto Numbering")}
     breadcrumb={[
       { title: __("Settings"), link: "/settings" },
       { title: __("Auto Numbering"), link: "/settings/auto-numbering" },
       { title: __(currentId ? "Edit Auto Numbering" : "New Auto Numbering") },
     ]}
   />
 );


 return (
   <Wrapper
     header={header}
     content={
       <div style={{ padding: "20px", maxWidth: "600px" }}>
         {/* Your existing form fields */}
         <Button btnStyle="success" onClick={handleSave}>
           {__("Save")}
         </Button>
       </div>
     }
   />
 );
};


export default AutoNumberingForm;
