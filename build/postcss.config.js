module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: [
        './workshops/common-content/**/*.html',
        './workshops/common-content/js/**/*.js'
      ],
      defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
    }),
    require('cssnano')({
      preset: 'default'
    })
  ]
};