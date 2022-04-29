import axios from 'axios'
import * as cheerio from 'cheerio'
import scrapMeta from './update_meta'

interface Game {
  name: string
  image: string
  date: string
  rating: number
  price: number
  bargainPrice: number
  discountRate: number
  tag: string
  serialNum: string
}

let href: string[] = []
let gameList: Game[] = []

async function scrapTitlesUrl(URI: string): Promise<void> {
  try {
    const response = await axios.get(URI)
    const $ = cheerio.load(response.data)

    $('.category-product-item-title-link').each((idx: any, item: any) =>
      href.push(item.attribs.href)
    )
    console.log('Scrapping URI completed')
  } catch (error) {
    console.log(error)
  }
}

export default async function scrapTitleInfo(URI: string): Promise<Game[] | void> {
  try {
    await scrapTitlesUrl(URI)

    for (let link of href) {
      const response = await axios.get(link)
      const $ = cheerio.load(response.data)

      const name: string = $('.product > h1 > span').text()

      if (name.includes('이용권') || name.includes('선불 번호')) continue

      const selector = $('img')
      let image: string = ''

      $(selector).each((idx: number, data: any) => {
        const uri: string = data.attribs.src
        if (uri.includes('media/catalog/product')) {
          image = uri
        }
      })

      const date: string = $('.release_date .product-attribute-val').text().replace(/(\s*)/g, '')

      const priceText: string =
        $('.old-price .price').text() || $('.product-page-info-form .price').text() || ''
      const bargainPriceText: string = $('.special-price .price').text() || priceText || ''
      const price: number = parseInt(priceText.replace(/[₩,]/g, '')) || NaN
      const bargainPrice: number = parseInt(bargainPriceText.replace(/[₩,]/g, '')) || NaN
      const discountRate: number = Math.round(((price - bargainPrice) / price) * 100) || 0

      const genre: string = $('.game_category .product-attribute-val').text()
      const playerNum: string =
        $('.no_of_players .product-attribute-val').text() === '1명' ? '싱글' : '싱글, 멀티'
      const languages: string[] = $('.supported_languages .product-attribute-val')
        .text()
        .split(', ')
      const language: string =
        languages[0] === '한국어' ? languages.slice(0, 2).join(', ') : languages[0]
      const serialNumText: string =
        $('.attribute-group-disclaimer .product-attribute-val').text() || ''
      const idx: number = serialNumText.indexOf('GC-')
      const serialNum: string = idx !== -1 ? serialNumText.substr(idx, 19) : ''

      const rating: number = (await scrapMeta(serialNum)) || 0
      const tag: string = genre
        ? `${language}, ${playerNum}, ${genre}`
        : `${language}, ${playerNum}`

      const game: Game = {
        name,
        image,
        date,
        rating,
        price,
        bargainPrice,
        discountRate,
        tag,
        serialNum,
      }

      gameList.push(game)
    }

    return gameList
  } catch (error) {
    console.log(error)
  }
}
