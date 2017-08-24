const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  log.info('首页')
  await ctx.render('app/index/index', {
    title: '首页'
  })
})

router.get('/', async (ctx, next) => {
  log.info('详情页')
  await ctx.render('app/detail/index', {
    title: '详情页'
  })
})

module.exports = router
