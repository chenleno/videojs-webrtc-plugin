module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          esmodules: true,
        },
        // Use the equivalent of `babel-preset-modules`
        bugfixes: true,
        modules: false,
        loose: true,
      },
    ],
  ],
  plugins: ["@babel/plugin-transform-runtime"],
};
