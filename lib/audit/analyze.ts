import * as cheerio from 'cheerio'
import type { Report } from './types'

export function analyzeHtml(
  html: string,
  url: string,
  httpStatus: number,
  responseTimeMs: number,
  fetchedAt: string
): Report {
  const $ = cheerio.load(html)

  const title = extractTitle($)
  const metaDescription = extractMetaDescription($)
  const h1Count = $('h1').length
  const totalImages = $('img').length
  const imagesMissingAlt = countImagesMissingAlt($)
  const wordCount = countWords($)

  return {
    url,
    httpStatus,
    responseTimeMs,
    title,
    metaDescription,
    h1Count,
    imagesMissingAlt,
    totalImages,
    wordCount,
    fetchedAt,
  }
}

function extractTitle($: cheerio.CheerioAPI): string | null {
  const text = $('title').first().text().trim()
  return text || null
}

function extractMetaDescription($: cheerio.CheerioAPI): string | null {
  const content = $('meta[name="description"]').attr('content')
  return content !== undefined && content !== null ? content : null
}

function countImagesMissingAlt($: cheerio.CheerioAPI): number {
  let missing = 0
  $('img').each((_, el) => {
    const alt = $(el).attr('alt')
    if (alt === undefined) {
      missing++
    }
  })
  return missing
}

function countWords($: cheerio.CheerioAPI): number {
  const clones: string[] = []
  $('script, style, noscript').each((_, el) => {
    const $el = $(el)
    clones.push($el.html() ?? '')
    $el.remove()
  })

  const text = $('body').text()
  const tokens = text.split(/\s+/).filter((t) => t.length > 0)
  return tokens.length
}
