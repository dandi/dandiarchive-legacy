process.env.VUE_APP_VERSION = process.env.COMMIT_REF;

module.exports = {
  parallel: false,
  lintOnSave: 'error',
  configureWebpack: {
    devtool: 'source-map',
  },
};
