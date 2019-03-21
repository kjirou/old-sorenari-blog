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

/**
 * @param props {articleContent, articleTitle, blogName, githubUrl, newBlogUrl}
 */
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
          <li><a href="<%- publicRootUrl %>">トップへ</a></li>
          <li><a href="<%- newBlogUrl %>">新ブログへ</a></li>
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

    const html = templateArticle({
      articleContent: article.rawMainContent,
      articleTitle: article.rawPageTitle,
      blogName: BLOG_NAME,
      lastUpdatedDateString: article.rawDate,
      newBlogUrl: NEW_BLOG_URL,
      publicRootUrl,
    });

    return Object.assign({
      filePath: path.join(articlesDir, `${uniqueId}.html`),
      html,
      permalink: `${publicArticlesUrl}${uniqueId}.html`,
      uniqueId,
    }, article);
  })
;

fs.ensureDirSync(articlesDir);
articles.forEach(article => {
  fs.writeFileSync(article.filePath, article.html);
});