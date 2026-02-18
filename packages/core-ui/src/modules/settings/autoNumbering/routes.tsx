import React from "react";
import { Routes, Route } from "react-router-dom";


import AutoNumberingListContainer from "./container/autoNumberingList";
import AutoNumberingForm from "./components/autoNumberingForm";


const routes = () => (
 <>




<Routes>
 <Route path="/settings/auto-numbering" element={<AutoNumberingListContainer />} />
 <Route path="/settings/auto-numbering/new" element={<AutoNumberingForm />} />
</Routes>


 </>
);


export default routes;
