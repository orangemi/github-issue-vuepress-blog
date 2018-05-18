const path = require('path')
const fs = require('mz/fs')
const {request} = require('urllib')
const child = require('mz/child_process')
const removeMD = require('remove-markdown')

const labels = process.env.BLOG_LABELS || 'blog,release'
const author = process.env.AUTHOR || 'orangemi'
const repo = process.env.REPO || 'orangemi.github.io'

async function main () {
  await child.exec(`rm -rf docs && mkdir docs`)
  const indexStream = fs.createWriteStream(path.resolve(__dirname, '../docs/README.md'))
  indexStream.write('Index\r=====\r\r')
  while (true) {
    const blogs = await fetch(1)
    writeContent(indexStream, blogs)
    if (blogs.length < 30) break
  }
  indexStream.end()
}

async function writeContent (indexStream, blogs) {
  blogs.forEach(blog => {
    const title = `${blog.number}-${blog.title}`
    const filepath = path.resolve(__dirname, '../docs/', `${title}.md`)
    const filestream = fs.createWriteStream(filepath)

    filestream.write(blog.body)
    filestream.end()
    indexStream.write(`## [${title}](./${encodeURIComponent(title)}.md)\r`)
    const summary = removeMD(blog.body).substring(0, 50).replace(/[\r\n]/g, ' ') + '...\r\r'
    indexStream.write(summary)
  })
}

async function fetch (page = 1) {
  const resp = await request(`https://api.github.com/repos/${author}/${repo}/issues?creator=${author}&labels=${labels}&page=${page}`, {
    headers: {
      // accept: 'application/vnd.github.symmetra-preview+json',
    },
    dataType: 'json'
  })
  return resp.data
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
