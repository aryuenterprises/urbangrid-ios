module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-worklets/plugin',
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blocklist: null,      // use blocklist instead of blacklist
        allowlist: null,      // use allowlist instead of whitelist
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
};