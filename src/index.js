import express from "express"
import fs from 'fs';
import jsdom from 'jsdom'
import { MongoClient, ObjectId } from 'mongodb'
import path from 'path'

const fsp = fs.promises;
const app = express();

app.listen(3034)

const uri = "mongodb://localhost/ilp?retryWrites=true&w=majority"
const client = new MongoClient(uri);

// <title>RoyalUr.net | Play a friend, play online, or play the AI!</title>

// <meta name="og:title" content="RoyalUr.net">
// <meta name="twitter:title" content="RoyalUr.net">
// <meta property="twitter:url" content="https://royalur.net/">
// <meta name="description" content="Can you master the world's oldest board game? Play online, with a friend, or against the AI!">
// <meta name="og:description" content="Can you master the world's oldest board game? Play online, with a friend, or against the AI!">
// <meta name="twitter:description" content="Can you master the world's oldest board game? Play online, with a friend, or against the AI!">

// <!-- This is the boilerplate included in the <head> of every page, except the game. -->
// <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
// <!-- This is the boilerplate included in the <head> of every page. -->
// <meta property="twitter:domain" content="royalur.net">
// <meta name="og:determiner" content="">
// <meta name="og:type" content="website">
// <meta name="og:locale" content="en_US">
// <meta name="og:image" content="https://royalur.net/banner.v1614055952.jpg">
// <meta name="twitter:card" content="summary_large_image">
// <meta name="twitter:image" content="https://royalur.net/banner.v1614055952.jpg">

const metaInfos = [
    { meta: "description", content: "description", db: true },
    { meta: "og:description", content: "description", db: true },
    { meta: "twitter:description", content: "description", db: true },
    { meta: "twitter:description", content: "description", db: true },
    { meta: "og:site_name", content: "ILP Showcase NBSC Manly", db: false },
]

function getAuthorString(authors) {
    if (authors.length === 1) {
        return authors[0]
    } else if (authors.length === 2) {
        return authors[0] + ' and ' + authors[1];
    }
    const last = authors.pop();
    return authors.join(', ') + ' and ' + last;
}


app.get("/:articleId/", async (req, res) => {
    const id = req.params.articleId
    try {
        const database = client.db('ilp');
        const articles = database.collection('article')
        const article = await articles.findOne({ _id: new ObjectId(id) })
        console.log(article)

        if (article === null) {
            res.status(400)
            res.send("Article Not Found")
            return
        }

        const result = await fsp.readFile(`/opt/ilpArticles/${id}/index.html`, 'utf8')
        console.log(result)

        if (article.type === 'textEditor') {
            res.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="description" content="Independent Learning Project | Manly Campus | Northern Beaches Secondary College">
              <title>${article.title} by ${getAuthorString(article.authors)} | ILP | Manly Selective Campus</title>
            
              <!-- Icons -->
              <link rel="shortcut icon" href="https://dev.oggyp.com/resources/favicons/favicon.ico" type="image/x-icon">
              <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
                    rel="stylesheet">
            
              <!-- Stylesheets -->
              <link rel="stylesheet" href="https://dev.oggyp.com/ilp/resources/stylesheets/css/main.css">
              <link rel="stylesheet" href="https://dev.oggyp.com/ilp/resources/stylesheets/css/simplified_nav.css">
            
              <!-- Fonts -->
              <link rel="stylesheet" href="https://cdn.oggyp.com/fonts/Google.css">
            
              <!-- Scripts -->
              <script src="https://dev.oggyp.com/ilp/resources/scripts/javascript/nav.js" defer></script>
            </head>
            <body class="has-article">
              <nav>
                <div id='main-nav'>
                  <a class="aria-only focusable" id="skip-main-nav-button" href="#main">Skip to main content</a>
            
                  <buttonimage.pngimage.png
                    id='main-nav-button'
                    aria-label='Open Navigation Button'
                    onclick='toggleNav()'
                  >
                    <span class="material-icons-outlined open-button" role="presentation">close</span>
                    <span class="material-icons-outlined close-button" role="presentation">menu</span>
                  </button>
            
            
                  <nav class='collapsing' id='main-menu' aria-label='Main Menu'>
                    <ul>
                      <li>
                        <h2>
                          <span class="material-icons-outlined" role="presentation">article</span>
                          Pages
                        </h2>
            
                        <nav class='submenu' aria-label='Pages Submenu'>
                          <ul>
                            <li>
                              <a href='https://ilp.oggyp.com'>
                                <span class="material-icons-outlined" role="presentation">home</span>
                                Home
                              </a>
                            </li>
                          </ul>
                        </nav>
                      </li>
                    </ul>
                  </nav>
                </div>
              </nav>
            
              <main id="main">
                <article>
                  <h1 class="title">${article.title}</h1>
                  <span class="subtitle">${article.tags.join(", ")}</span>
            
                  <div class="authors">
                    by ${getAuthorString(article.authors)}
                  </div>
            
                  <div class="paper">
                    <span class="question">${article.question}</span>
            
                    ${result}
                  </div>
                </article>
              </main>
            </body>
            </html>`)
        } else {

            const dom = new jsdom.JSDOM(result)
            let script = dom.window.document.createElement('script')
            script.src = 'https://ilp.oggyp.com/resources/ilp-script.js';
            dom.window.document.getElementsByTagName('head')[0].appendChild(script);

            for (let i = 0; i < metaInfos.length; i++) {
                const metaInfo = metaInfos[i]
                let meta = dom.window.document.createElement('meta')
                meta.name = metaInfo.meta
                if (metaInfo.db)
                    meta.content = article[metaInfo.content]
                else
                    meta.content = metaInfo.content
                console.log(meta.content)
                dom.window.document.getElementsByTagName('head')[0].appendChild(meta);
            }

            // title
            const title = article.students.join(" ") + ' | ' + article.title
            let meta = dom.window.document.createElement('meta')
            meta.name = "og:title"
            meta.content = title
            dom.window.document.getElementsByTagName('head')[0].appendChild(meta);
            meta = dom.window.document.createElement('meta')
            meta.name = "twitter:title"
            meta.content = title
            dom.window.document.getElementsByTagName('head')[0].appendChild(meta);

            res.send(dom.serialize())
        }
    } catch (e) {
        res.status(400)
        res.send("This Article Is Under Construction!")
        return
    }
})

app.get("/:articleId/:fileName", async (req, res) => {
    const id = req.params.articleId
    const fileName = req.params.fileName
    res.sendFile(path.join('/opt/ilpArticles', id, fileName));
})