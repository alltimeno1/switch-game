'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const { client, connectCollection } = require('./mongo')
const crawling_1 = require('./crawling')
async function main() {
  try {
    const games = await connectCollection('games')
    const gameList = await (0, crawling_1.default)()
    // Reset
    await games.deleteMany({})
    await games.insertMany(gameList)
    await client.close()
    console.log('Database updated!!')
  } catch (error) {
    console.log(error)
  }
}
main()
