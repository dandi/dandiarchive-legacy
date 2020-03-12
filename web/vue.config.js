process.env.VUE_APP_VERSION = process.env.COMMIT_REF;

module.exports = {
  parallel: false,
  lintOnSave: false,
  configureWebpack: {
    devtool: 'source-map',
  },
};
