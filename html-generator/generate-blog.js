#!/usr/bin/env node

const fs = require('fs-extra');
const lodash = require('lodash');
const path = require('path');

const ARTICLES_RELATIVE_PATH = 'articles';
const BLOG_NAME = '旧それなりブログ';
const NEW_BLOG_URL = 'https://kjirou.github.io/blog/';
const GITHUB_URL = 'https://github.com/kjirou/old-sorenari-blog/';
const PUBLIC_ROOT_URL = 'https://kjirou.github.io';
const PUBLIC_PATH = '/old-sorenari-blog/';

const docsDir = path.join(__dirname, '../docs');
const articlesDir = path.join(docsDir, ARTICLES_RELATIVE_PATH);
const publicRootUrl = PUBLIC_ROOT_URL + PUBLIC_PATH;
const publicArticlesUrl = `${publicRootUrl}${ARTICLES_RELATIVE_PATH}/`;

const rawPages = require(path.join(__dirname, '../crawling/extended-raw-pages.json'));


//
// Generate articles
//
const templateArticle = (props) => {
  const compiledTemplate = lodash.template(`<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <title><%= articleTitle %> | <%- blogName %></title>
  </head>
  <body>
    <header>
      <p><%= blogName %>の跡地</p>
      <nav>
        <ul>
          <li><a href="<%- publicPath %>">トップ</a></li>
          <li><a href="<%- newBlogUrl %>">新ブログ</a></li>
          <li><a href="<%- githubUrl %>">GitHub</a></li>
        </ul>
      </nav>
    </header>
    <article>
      <section>
        <h1><%= articleTitle %></h1>
        <p><%- lastUpdatedDateString %></p>
      </section>
      <section>
        <%= articleContent %>
      </section>
    </article>
  </body>
</html>
`);
  return compiledTemplate(props);
};

const articles = rawPages
  .map(rawPage => Object.assign({}, rawPage))
  .map(article => {
    const uniqueId = article.originalSourceUrl.replace(/^.+\/(\d+)$/, '$1');
    if (/^\d+$/.test(uniqueId) === false) {
      throw new Error('Invalid uniqueId');
    }

    const fileName = uniqueId + '.html';
    const html = templateArticle({
      articleContent: article.rawMainContent,
      articleTitle: article.rawPageTitle,
      blogName: BLOG_NAME,
      githubUrl: GITHUB_URL,
      lastUpdatedDateString: article.rawDate,
      newBlogUrl: NEW_BLOG_URL,
      publicPath: PUBLIC_PATH,
    });

    return Object.assign({
      filePath: path.join(articlesDir, fileName),
      html,
      permalink: `${publicArticlesUrl}${fileName}`,
      rootRelativeUrl: `${PUBLIC_PATH}${ARTICLES_RELATIVE_PATH}/${fileName}`,
      uniqueId,
    }, article);
  })
;


//
// Generate the index.html
//
const templateIndexPage = (props) => {
  const compiledTemplate = lodash.template(`<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <title><%- blogName %></title>
  </head>
  <body>
    <header>
      <p><%- blogName %>の跡地</p>
      <nav>
        <ul>
          <li><a href="<%- publicPath %>">トップ</a></li>
          <li><a href="<%- newBlogUrl %>">新ブログ</a></li>
          <li><a href="<%- githubUrl %>">GitHub</a></li>
        </ul>
      </nav>
    </header>
    <article>
      <section>
        <h1><%- blogName %></h1>
      </section>
      <section>
        <ul>
          <%= content %>
        </ul>
      </section>
    </article>
  </body>
</html>
`);
  return compiledTemplate(props);
};

const generateIndexPageContent = (articles) => {
  return articles.slice().reverse().map(article => {
    return lodash.template(
      '<li><a href="<%- rootRelativeUrl %>"><%= title %></a> (<%- rawDate %>)</li>'
    )({
      title: article.rawPageTitle,
      rootRelativeUrl: article.rootRelativeUrl,
      rawDate: article.rawDate,
    });
  }).join('\n');
};

const indexPage = {
  filePath: path.join(docsDir, 'index.html'),
  html: templateIndexPage({
    blogName: BLOG_NAME,
    content: generateIndexPageContent(articles),
    githubUrl: GITHUB_URL,
    newBlogUrl: NEW_BLOG_URL,
    publicPath: PUBLIC_PATH,
  }),
};


//
// Write articles
//
fs.ensureDirSync(articlesDir);
articles.forEach(article => {
  fs.writeFileSync(article.filePath, article.html);
});


//
// Write other pages
//
fs.writeFileSync(indexPage.filePath, indexPage.html);
