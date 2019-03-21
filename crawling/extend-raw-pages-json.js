#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

const rawPages = require(path.join(__dirname, 'raw-pages.json'));
const urlAndTitlePairs = fs.readFileSync(path.join(__dirname, 'article-urls.txt')).toString().split('\n')
  .map(pairString => pairString.split('::::'))
  .map(([url, title]) => ({url, title}))
;

const findUrlAndTitlePairByTitle = (title) => {
  return urlAndTitlePairs.find(e => e.title === title);
};

const extendedRawPages = [];
let errorFound = false;
rawPages.forEach(rawPage => {
  const rawPageTitleForFindingUrl = {
    'for文へのリストに&#8221;/*&#8221;とかが入ってしまうとき': 'for文へのリストに”/*”とかが入ってしまうとき',
    '&#8220;?>&#8221;の後に改行が入ってた': '“?>”の後に改行が入ってた',
    'scriptタグを &#8220;/>&#8221; で閉じられないのは': 'scriptタグを “/>” で閉じられないのは',
    '&#8220;str&#8221; と new String(&#8220;str&#8221;) の違い': '“str” と new String(“str”) の違い',
    '&#8220;javascript:void(0);&#8221;をhrefに指定したときにハマる': '“javascript:void(0);”をhrefに指定したときにハマる',
    'PHP5のforeach($hash as &#038;$val) を': 'PHP5のforeach($hash as &$val) を',
    'Google Code <s>がわからん</s>は悪くない': 'Google Code がわからんは悪くない',
    'PHPは&#8221;PHP: Hypertext Preprocessor&#8221;の略だってー！': 'PHPは”PHP: Hypertext Preprocessor”の略だってー！',
    'AS3で for &#8230;in の取り出し順が不明': 'AS3で for …in の取り出し順が不明',
    'Gateway.swf &#8211; sample &#8211;': 'Gateway.swf – sample –',
    '!&#8221;key&#8221; in object がJSとAS3で挙動が違う': '!”key” in object がJSとAS3で挙動が違う',
    'SWFGateway.js &#8211; version 0.3 &#8211;': 'SWFGateway.js – version 0.3 –',
    '指定DIR以下の&#8217;.svn&#8217;以下を全部削除するコマンド': '指定DIR以下の’.svn’以下を全部削除するコマンド',
    '[PHP,ZF] アクション名を&#8221;camelCased&#8221;で指定できなくなってる': '[PHP,ZF] アクション名を”camelCased”で指定できなくなってる',
    '[PHP] 入力フォームのname属性に&#8221;.&#8221;を入れると&#8221;_&#8221;に置換されている': '[PHP] 入力フォームのname属性に”.”を入れると”_”に置換されている',
    '[Python] 英語の省略形月名(Jan, Feb, Mar, Apr &#8230;)の場所': '[Python] 英語の省略形月名(Jan, Feb, Mar, Apr …)の場所',
    '[Mercurial] Couldn&#8217;t import standard bz2': '[Mercurial] Couldn’t import standard bz2',
    '[Shell] $(cd $(dirname $0) &#038;&#038; pwd) を理解する': '[Shell] $(cd $(dirname $0) && pwd) を理解する',
    '[PHP] It is not safe to rely on the system&#8217;s timezone settings': '[PHP] It is not safe to rely on the system’s timezone settings',
    '[MySQL] 先頭が &#8220;test_&#8221; データベース名には権限を解放': '[MySQL] 先頭が “test_” データベース名には権限を解放',
    'Backbone.jsで Uncaught TypeError: Property &#8216;$&#8217; of object #&lt;Object&gt; is not a function': 'Backbone.jsで Uncaught TypeError: Property ‘$’ of object #<Object> is not a function',
    '[jQuery] Cannot set property &#8216;cur&#8217; of undefined': '[jQuery] Cannot set property ‘cur’ of undefined',
    'スマホゲー『Dungeons &#038; Parties』': 'スマホゲー『Dungeons & Parties』',
    'Dungeons &#038; Parties の開発的な話': 'Dungeons & Parties の開発的な話',
    'Dungeons &#038; Parties あとがき': 'Dungeons & Parties あとがき',
    '[MongoDB] Type &#8220;it&#8221; for more が面倒な場合': '[MongoDB] Type “it” for more が面倒な場合',
    'Denzi さん白黒16&#215;16画像改変素材': 'Denzi さん白黒16×16画像改変素材',
    'Reactでもアニメーションがしたい!': 'Reactでも アニメーションがしたい!',
  }[rawPage.rawPageTitle] || rawPage.rawPageTitle;
  const found = findUrlAndTitlePairByTitle(rawPageTitleForFindingUrl);
  if (!found) {
    errorFound = true;
    console.error(rawPage.rawPageTitle);
  }

  extendedRawPages.push(Object.assign({}, rawPage, {
    rawPageTitleForFindingUrl,
    originalSourceUrl: found.url,
  }));
});

if (errorFound) {
  console.error('Error ocurred');
  process.exit(1);
}

fs.writeFileSync(
  path.join(__dirname, 'extended-raw-pages.json'),
  JSON.stringify(extendedRawPages, null, 2)
);

process.exit();
