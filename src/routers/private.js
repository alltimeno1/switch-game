const router = require('express').Router()
const { connectCollection } = require('../js/mongo')
const requestIp = require('request-ip')

// MY 페이지 조회
router.get('', async (req, res, next) => {
  try {
    const games = await connectCollection('games')
    const buckets = await connectCollection('buckets')
    const status = req.isAuthenticated()
    let myList = []

    if (req.isAuthenticated()) {
      myList = await buckets.findOne({ user_id: req.user.id })
    } else {
      const ip = requestIp.getClientIp(req)

      myList = await buckets.findOne({ address: ip })
    }

    const result = await games
      .find({ name: { $in: myList?.list || [] } })
      .toArray()

    res.render('private', { result, status })
  } catch (error) {
    return next(error.message)
  }
})

// MY 페이지 아이템 삭제
router.post('/delete', async (req, res, next) => {
  try {
    const buckets = await connectCollection('buckets')

    if (req.isAuthenticated()) {
      await buckets.updateOne(
        { user_id: req.user.id },
        { $pull: { list: req.body.titleName } }
      )
    } else {
      const ip = requestIp.getClientIp(req)

      await buckets.updateOne(
        { address: ip },
        { $pull: { list: req.body.titleName } }
      )
    }

    res.redirect('/private')
  } catch (error) {
    return next(error.message)
  }
})

// MY 페이지 아이템 리셋
router.post('/reset', async (req, res, next) => {
  try {
    const buckets = await connectCollection('buckets')

    if (req.isAuthenticated()) {
      await buckets.updateOne({ user_id: req.user.id }, { $set: { list: [] } })
    } else {
      const ip = requestIp.getClientIp(req)

      await buckets.updateOne({ address: ip }, { $set: { list: [] } })
    }

    res.redirect('/private')
  } catch (error) {
    return next(error.message)
  }
})

module.exports = router
