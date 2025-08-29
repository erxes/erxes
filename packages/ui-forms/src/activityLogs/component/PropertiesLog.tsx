// import React from "react";
// import {
//   ActivityDate,
//   FlexBody,
//   FlexCenterContent,
// } from "@erxes/ui-log/src/activityLogs/styles";
// import Tags from "@erxes/ui/src/components/Tags";
// import Tip from "@erxes/ui/src/components/Tip";
// import dayjs from "dayjs";
// import { renderUserFullName } from "@erxes/ui/src/utils";
// import GenerateCustomFields from "@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields";

// type PropertiesLogProps = {
//   activity: any;
// };

// const PropertiesLog: React.FC<PropertiesLogProps> = ({ activity }) => {
//   const renderContent = () => {
//     const { createdByDetail, customFieldsData, content } = activity;
//     console.log(activity, "activity");

//     const fields = content?.customFieldsData || [];

//     let userName = "Unknown";

//     if (createdByDetail && createdByDetail.type === "user") {
//       const { content } = createdByDetail;

//       if (content && content.details) {
//         userName = renderUserFullName(createdByDetail.content);
//       }
//     }

//     return (
//       <span>
//         {userName} changed properties to
//         {fields.map((field, index) => (
//           <GenerateCustomFields field={field} key={index} isEditing={true} />
//         ))}
//       </span>
//     );
//   };

//   const { createdAt } = activity;

//   return (
//     <FlexCenterContent>
//       <FlexBody>{renderContent()}</FlexBody>
//       <Tip text={dayjs(createdAt).format("llll")}>
//         <ActivityDate>{dayjs(createdAt).format("MMM D, h:mm A")}</ActivityDate>
//       </Tip>
//     </FlexCenterContent>
//   );
// };

// export default PropertiesLog;
