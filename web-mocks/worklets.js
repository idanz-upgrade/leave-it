// Web mock for react-native-worklets (Hermes-only package)
module.exports = {
  installOnUIRuntime: () => {},
  runOnUI: (fn) => fn,
  runOnJS: (fn) => fn,
};
