const authRouter = require("./auth/auth-routes");

const adminProductsRouter = require("./admin/products-routes");
const adminOrderRouter = require("./admin/order-routes");
const adminDashboardRouter = require("./admin/dashboard-routes");

const shopProductsRouter = require("./shop/products-routes");
const shopCartRouter = require("./shop/cart-routes");
const shopAddressRouter = require("./shop/address-routes");
const shopOrderRouter = require("./shop/order-routes");
const shopSearchRouter = require("./shop/search-routes");
const shopReviewRouter = require("./shop/review-routes");

const commonFeatureRouter = require("./common/feature-routes");
const commonUserRouter = require("./common/user-routes");
module.exports = {
  authRouter,
  adminProductsRouter,
  adminOrderRouter,
  adminDashboardRouter,
  shopProductsRouter,
  shopCartRouter,
  shopAddressRouter,
  shopOrderRouter,
  shopSearchRouter,
  shopReviewRouter,
  commonFeatureRouter,
  commonUserRouter,
};
