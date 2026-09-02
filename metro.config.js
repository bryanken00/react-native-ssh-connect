const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// inlineRem: 16 is required by React Native Reusables
module.exports = withNativeWind(config, {
  input: "./global.css",
  inlineRem: 16,
});
