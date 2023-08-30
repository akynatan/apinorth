module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript'
  ],
  plugins: [
    ['module-resolver', {
      alias: {
        '@services': './src/services',
        '@routes': './src/routes',
        '@entities': './src/entities',
        '@repositories': './src/repositories',
        '@irepositories': './src/irepositories',
        '@dtos': './src/dtos',
        '@apis': './src/apis',
        '@config': './src/config',
        '@shared': './src/shared',
        '@crons': './src/crons',
        '@errors': './src/errors',
        '@constants': './src/constants',
        '@constants': './src/constants',
        '@helpers': './src/helpers',
        '@middlewares': './src/middlewares'
      }
    }],
    'babel-plugin-transform-typescript-metadata',
    ['@babel/plugin-proposal-decorators', { 'legacy': true }],
    ['@babel/plugin-proposal-class-properties', { 'loose': true }]
  ],
}
