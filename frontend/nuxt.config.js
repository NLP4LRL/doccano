import colors from 'vuetify/es5/util/colors'
import i18n from './i18n'

export default {
  ssr: false,
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: '%s - NLP4LRL Annotation',
    title: 'NLP4LRL Annotation',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },

  server: {
    host: '0.0.0.0' // default: localhost
  },

  env: {
    baseUrl: '/v1'
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/filters.js',
    '~/plugins/vue-youtube.js',
    '~/plugins/vue-shortkey.js',
    '~/plugins/vue-konva.js',
    '~/plugins/services.ts',
    '~/plugins/repositories.ts',
    '~/plugins/color.ts',
    '~/plugins/role.ts'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    ['nuxt-i18n', i18n],
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/eslint-module'
  ],

  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/composition-api/module',
    [
      '@nuxtjs/google-analytics',
      {
        id: process.env.GOOGLE_TRACKING_ID
      }
    ],
    [
      '@nuxtjs/vuetify',
      {
        customVariables: ['~/assets/css/fonts.css'],
        treeShake: true,
        defaultAssets: {
          font: false,
          icons: ['mdiSvg']
        }
      }
    ],
    [
      '@nuxtjs/google-fonts',
      {
        families: {
          Roboto: [100, 300, 400, 500, 700, 900]
        },
        display: 'swap',
        download: true,
        overwriting: true,
        inject: true
      }
    ]
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    proxy: true
  },

  proxy: {
    // Use a fake value for use at build-time
    '/v1/': {
      target: process.env.API_URL || 'http://127.0.0.1:8000'
    },
    '/media': {
      target: process.env.API_URL || 'http://127.0.0.1:8000'
    }
  },
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    theme: {
      primary: colors.blue.darken2,
      accent: colors.grey.darken3,
      secondary: colors.amber.darken3,
      info: colors.teal.lighten1,
      warning: colors.amber.base,
      error: colors.deepOrange.accent4,
      success: colors.green.accent3,
      themes: {
        dark: {
          primary: '#3b82f6',
          accent: '#2563eb',
          secondary: '#1e40af',
          success: '#10b981',
          info: '#3b82f6',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        light: {
          primary: '#2563eb',
          accent: '#3b82f6',
          secondary: '#1e40af',
          success: '#10b981',
          info: '#3b82f6',
          warning: '#f59e0b',
          error: '#ef4444'
        }
      }
    }
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    publicPath: process.env.PUBLIC_PATH || '/_nuxt/',
    extend(config, _) {
      // config.module.rules.push({
      //   test: /\.(txt|csv|conll|jsonl)$/i,
      //   loader: 'file-loader',
      //   options: {
      //     name: '[path][name].[ext]'
      //   }
      // })
      config.module.rules.push({
        enforce: 'pre',
        test: /\.(txt|csv|json|jsonl)$/,
        loader: 'raw-loader',
        exclude: /(node_modules)/
      })
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      })
    }
  }
}
