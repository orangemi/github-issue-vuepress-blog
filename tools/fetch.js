const path = require('path')
const fs = require('mz/fs')
const axios = require('axios').default
const child = require('mz/child_process')
const removeMD = require('remove-markdown')

const labels = process.env.BLOG_LABELS || 'blog,release'
const author = process.env.AUTHOR || 'orangemi'
const repo = process.env.REPO || 'orangemi.github.io'

async function main () {
  await child.exec(`rm -rf docs && mkdir docs`)
  const indexStream = fs.createWriteStream(path.resolve(__dirname, '../docs/README.md'))
  indexStream.write('Index\r=====\r\r')
  let page = 1
  while (true) {
    const blogs = await fetch(page++)
    if (!Array.isArray(blogs)) break
    console.log('fetched', blogs.length, 'blogs')
    writeContent(indexStream, blogs)
    if (blogs.length < 30) break
  }
  indexStream.end()
  console.log('fetch complete')
}

async function writeContent (indexStream, blogs) {
  blogs.forEach(blog => {
    const title = `${blog.number}-${blog.title}`
    const filepath = path.resolve(__dirname, '../docs/', `${blog.number}.md`)
    const filestream = fs.createWriteStream(filepath)

    filestream.write(blog.title + '\r===\r\r')
    filestream.write(blog.body)
    filestream.end()
    indexStream.write(`## [${title}](./${encodeURIComponent(blog.number)}.md)\r`)
    const summary = removeMD(blog.body).substring(0, 50).replace(/[\r\n]/g, ' ') + '...\r\r'
    indexStream.write(summary)
  })
}

async function fetch (page = 1) {
  const resp = await axios.get(`https://api.github.com/repos/${author}/${repo}/issues?creator=${author}&labels=${labels}&page=${page}`)
  if (resp.status !== 200) {
    const e = new Error('fetch error')
    Object.assign(e, {status: resp.status, headers: resp.headers, data: resp.data})
    throw e
  }
  return resp.data
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
