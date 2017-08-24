const CURRENT_PATH = '.'

const debug = require('debug')('luojilab')

const renderConf = require(CURRENT_PATH + '/config/renderConfig')
const glob = require('glob')
// const express = require('express')
// const favicon = require('serve-favicon')
// const cookieParser = require('cookie-parser')
// const bodyParser = require('body-parser')
// const compress = require('compression')

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

// console.log(WEBPACK_HASH_MAP)

const render = require(CURRENT_PATH + '/server/middleware/render')
// const app = express()
const env = process.env.SERVER_CONFIG || 'testing'

app.use(async function(ctx, next) {
  ctx.state.ENV = env
  ctx.state.ENV_DEVELOPMENT = env === 'development'
  ctx.state.WEBPACK_HASH_MAP = WEBPACK_HASH_MAP

  await next()
})


// app.set('views', renderConf.root + '/server/views')
// app.set('view engine', 'html')


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
// app.use(favicon(renderConf.root + '/public/favicon.ico'))
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({extended: true}))
// app.use(cookieParser())?
// app.use(compress())?
// app.use(express.static(renderConf.root + '/public'))



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
  extension: 'html'
}))

// app.use(render)

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
