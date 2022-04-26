const router = require('express').Router()
const { connectCollection } = require('../js/mongo')
const requestIp = require('request-ip')

router.get('/', (req, res) => res.send('URL should contain /home'))

router.get('/:page', async (req, res, next) => {
  try {
    const { page } = req.params
    const games = await connectCollection('games')

    if (page === 'home') {
      const best = await games.find().sort({ rating: -1 }).limit(4).toArray()
      const recent = await games.find().sort({ date: -1 }).limit(4).toArray()
      const sale = await games
        .find()
        .sort({ discountRate: -1 })
        .limit(4)
        .toArray()

      res.render('index', { best, recent, sale })
    } else if (page === 'private') {
      const ip = requestIp.getClientIp(req)
      const games = await connectCollection('games')
      const buckets = await connectCollection('buckets')
      const myList = await buckets.findOne({ address: ip })
      const result = await games.find({ name: { $in: myList.list } }).toArray()

      res.render('private', { result })
    } else if (page === 'login') {
      res.send('준비 중입니다. 조금만 기다려 주세요 :)')
    } else {
      res.render(`${page}`)
    }
  } catch (error) {
    return next(error.message)
  }
})

module.exports = router
