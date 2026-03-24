const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Web: use 'default' transform profile (V8/browser-compatible, not Hermes bytecode)
config.transformer = config.transformer || {};
config.transformer.unstable_allowRequireContext = true;

// Resolve: mock Hermes/native-only packages on web
config.resolver = config.resolver || {};
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (moduleName === 'react-native-worklets' || moduleName === 'react-native-worklets/src') {
      return { type: 'sourceFile', filePath: require.resolve('./web-mocks/worklets.js') };
    }
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
