// const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

// const defaultConfig = getDefaultConfig(__dirname);
// const { assetExts, sourceExts } = defaultConfig.resolver;

// /**
//  * Metro configuration
//  * https://reactnative.dev/docs/metro
//  *
//  * @type {import('metro-config').MetroConfig}
//  */
// const config = {
//   transformer: {
//     babelTransformerPath: require.resolve(
//       "react-native-svg-transformer/react-native"
//     )
//   },
//   resolver: {
//     assetExts: assetExts.filter((ext) => ext !== "svg"),
//     sourceExts: [...sourceExts, "svg"]
//   }
// };

// module.exports = mergeConfig(defaultConfig, config);


const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
};

// First merge the default config with your custom config
const mergedConfig = mergeConfig(defaultConfig, config);

// Then wrap with Reanimated config
module.exports = wrapWithReanimatedMetroConfig(mergedConfig);

// const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
// const { withNativeWind } = require("nativewind/metro");
// const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

// const defaultConfig = getDefaultConfig(__dirname);
// const { assetExts, sourceExts } = defaultConfig.resolver;

// const config = {
//   transformer: {
//     babelTransformerPath: require.resolve('react-native-svg-transformer'),
//     getTransformOptions: async () => ({
//       transform: {
//         experimentalImportSupport: false,
//         inlineRequires: true,
//       },
//     }),
//   },
//   resolver: {
//     assetExts: assetExts.filter((ext) => ext !== 'svg'),
//     sourceExts: [...sourceExts, 'svg'],
//   },
// };

// // First merge with default config
// const mergedConfig = mergeConfig(defaultConfig, config);

// // Then wrap with Reanimated
// const reanimatedConfig = wrapWithReanimatedMetroConfig(mergedConfig);

// // Finally wrap with NativeWind
// module.exports = withNativeWind(reanimatedConfig, {
//   input: './global.css',
// });