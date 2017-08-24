const CURRENT_PATH = '.'
const debug = require('debug')('luojilab')
const renderConf = require(CURRENT_PATH + '/config/renderConfig')
const glob = require('glob')
const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const nunjucks = require('nunjucks')
// const logger = require('luojilab-log4js').use
const port = require('luojilab-port')

global.log = require('luojilab-log4js').logger

const WEBPACK_HASH_MAP = require(CURRENT_PATH + '/config/webpack-hash-map')

const render = require(CURRENT_PATH + '/server/middleware/render')
// const app = express()
const env = process.env.SERVER_CONFIG || 'testing'

app.use(async function(ctx, next) {
  ctx.state.ENV = env
  ctx.state.ENV_DEVELOPMENT = env === 'development'
  ctx.state.WEBPACK_HASH_MAP = WEBPACK_HASH_MAP

  await next()
})

const nunjuck = nunjucks.configure(renderConf.root + '/server/views', {
  autoescape: true,
  watch: true, // 依赖 chokidar
  // express: app,
  tags: {
    variableStart: '##',
    variableEnd: '##'
  }
})
debug(7)
nunjuck.addGlobal('staticBaseUrl', renderConf.staticBaseUrl)
logger(app)

const favicon = require('koa-favicon');

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(favicon(renderConf.root + '/public/favicon.ico'));
app.use(require('koa-static')(renderConf.root + '/public'))

app.use(views(renderConf.root + '/server/views', {
  map: {html: 'nunjucks' }
}))

app.use(render)

var mount = require('mount-koa-routes');
mount(app, renderConf.root + '/server/routes');

app.startServer = function() {

  var uri = 'http://127.0.0.1:' + port
  console.log('> Starting dev server...')

  app.listen(port, function () {
    console.log('> App (production) is now Listening at ' + uri + '\n')
  })

  this.use(async function (ctx, next) {
      var err = new Error('Not Found')
      err.status = 404
      await next(err)
  })
}

app.startServer()

module.exports = app
