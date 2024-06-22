import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import Settings from "./containers/config/Settings";
import Uom from "./containers/config/Uoms";
import GeneralSettings from "./components/config/GeneralSettings";
import SimilarityGroup from "./components/config/SimilarityGroup";

const ProductList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings List - ProductService" */ "./containers/product/ProductList"
    )
);

const ProductDetails = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings List - ProductService" */ "./containers/product/detail/ProductDetails"
    )
);

const BarcodeGenerator = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings List - ProductService" */ "./containers/barcodeGenerator/BarcodeGenerator"
    )
);

const Details = () => {
  const id = useParams();

  return <ProductDetails id={id.id} />;
};

const ProductService = () => {
  const location = useLocation();

  return <ProductList queryParams={queryString.parse(location.search)} />;
};

const GeneralSetting = () => {
  return <Settings component={GeneralSettings} />;
};

const SimilarityGroupComponent = () => {
  return <Settings component={SimilarityGroup} />;
};

const UomManage = () => {
  return <Uom />;
};

const BarcodeGeneratorComponent = () => {
  const id = useParams();
  const location = useLocation();

  return (
    <BarcodeGenerator
      id={id.id}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const routes = () => (
  <Routes>
    <Route
      path="/settings/product-service/details/:id"
      key="/settings/product-service/details/:id"
      element={<Details />}
    />

    <Route
      path="/settings/product-service/"
      key="/settings/product-service/"
      element={<ProductService />}
    />

    <Route
      path="/settings/products-config/"
      key="/settings/products-config/"
      element={<GeneralSetting />}
    />

    <Route
      path="/settings/similarity-group/"
      key="/settings/similarity-group"
      element={<SimilarityGroupComponent />}
    />

    <Route
      path="/settings/uoms-manage/"
      key="/settings/uoms-manage/"
      element={<UomManage />}
    />

    <Route
      path="/settings/barcode-generator/:id"
      key="/settings/barcode-generator/:id"
      element={<BarcodeGeneratorComponent />}
    />
  </Routes>
);

export default routes;
