const puppeteer = require("puppeteer")
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

let browsePromise = puppeteer.launch({
  args: [
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--disable-setuid-sandbox",
  ],
  headless: false,
  defaultViewport: { width: 1280, height: 720 },
})
const app = express()
app.use(cors())

exports.foods = app.post("/foods", async (req, res) => {
  const browser = await browsePromise
  const context = await browser.createIncognitoBrowserContext()

  try {
    const { endereco, comida } = req.body

    const page = await context.newPage()
    page.setDefaultNavigationTimeout(120000)
    const version = await page.browser().version()
    console.log(version)
    page.on("error", err => {
      console.log("error happen at the page: ", err)
    })

    page.on("pageerror", pageerr => {
      console.log("pageerror occurred: ", pageerr)
    })
    await page.goto("https://www.ifood.com.br/lista-restaurantes")
    await page.$eval(
      "body > div.ReactModalPortal > div > div > div > div > div > div:nth-child(1) > div > div > div.address-list-step__container.address-list-step__container--visible > div.address-search-input.address-search-input--role-button > button.address-search-input__button",
      button => button.click()
    )
    await page.waitForTimeout(2000)
    await page.evaluate(endereco => {
      //const message = 'av brasil oeste 888 passo fundo';

      const message = endereco
      console.log(endereco)
      document.execCommand("insertText", false, message)
    }, endereco)
    console.log("chegou")
    await page.waitForTimeout(3000)

    await page.$eval(
      "body > div.ReactModalPortal > div > div > div > div > div > div:nth-child(2) > div > div.address-search-step > div.address-search-step__results > ul > li:nth-child(1) > div > button",
      teste => teste.click()
    )
    await page.waitForTimeout(3000)

    //selecting address
    await page.$eval(
      "body > div.ReactModalPortal > div > div > div > div > div > div:nth-child(2) > div > div.address-search-step > div.address-search-step__results > ul > li:nth-child(1) > div > button",
      teste => teste.click()
    )
    //click map button twice
    await page.waitForTimeout(3000)
    await page.$eval(
      "body > div:nth-child(10) > div > div > div > div > div > div:nth-child(3) > div.address-maps__map > button",
      opa => opa.click()
    )
    await page.waitForTimeout(5000)
    await page.$eval(
      "body > div:nth-child(10) > div > div > div > div > div > div:nth-child(3) > div.address-finder__complete-form.address-finder__complete-form--active > div.complete-address > form > div.complete-address--save-btn > button",
      teste => teste.click()
    )
    await page.waitForTimeout(2000)
    await page.focus(
      "#__next > div:nth-child(1) > header > div.search-input > form > div > input"
    )

    //choosing the food
    //page.keyboard.type('cachorro quente')
    page.keyboard.type(comida)
    await page.waitForTimeout(1000)
    page.keyboard.press("Enter")
    await page.waitForTimeout(2000)
    await page.$eval("#marmita-tab1-3", aba => aba.click())
    const arrayProducts = []
    await page.waitForTimeout(3000)
    var tamanhoLista = await page.$eval(
      "#marmita-tab1-3",
      divs => divs.innerText
    )

    if (tamanhoLista.length === 9) {
      tamanhoLista = tamanhoLista.slice(7, 8)
      tamanhoLista = parseInt(tamanhoLista)
    } else if (tamanhoLista.length === 10) {
      tamanhoLista = tamanhoLista.slice(7, 9)
      tamanhoLista = parseInt(tamanhoLista)
    } else if (tamanhoLista.length === 11) {
      tamanhoLista = tamanhoLista.slice(7, 10)
      tamanhoLista = parseInt(tamanhoLista)
    }

    for (var i = 1; i <= tamanhoLista; i++) {
      const title = await page.$eval(
        `#marmita-panel1-3 > div > ul > li:nth-child(${i}) > div > a > div.dish-card__info > div > h3`,
        divs => divs.innerText
      )
      const description = await page.$eval(
        `#marmita-panel1-3 > div > ul > li:nth-child(${i}) > div > a > div.dish-card__info > div > span`,
        divs => divs.innerText
      )

      const link = await page.$eval(
        `#marmita-panel1-3 > div > ul > li:nth-child(${i}) > div > a`,
        a => a.href
      )
      var price = await page.$eval(
        `#marmita-panel1-3 > div > ul > li:nth-child(${i}) > div > a > div.dish-card__info > span.dish-card__price`,
        divs => divs.innerText
      )
      price = price.substring(0, 8)

      price = price.replace(/\$/g, "")
      price = price.replace(/R/g, "")

      price = parseFloat(price.replace(",", ".").replace(" ", ""))

      const tempo = await page.$eval(
        `#marmita-panel1-3 > div > ul > li:nth-child(${i}) > div > a > div.dish-card__info > span.dish-card__delivery > span.dish-card__delivery-time`,
        divs => divs.innerText
      )

      var entrega = await page.$eval(
        `#marmita-panel1-3 > div > ul > li:nth-child(${i}) > div > a > div.dish-card__info >  span.dish-card__delivery > span.dish-card__delivery-fee`,
        divs => divs.innerText
      )
      var total = 0

      if (entrega !== "Entrega grátis") {
        entrega = entrega.slice(10)
        entrega = parseFloat(entrega.replace(",", ".").replace(" ", ""))
        total = entrega + price
      } else {
        total = price
      }

      const logo = await page.$eval(
        `#marmita-panel1-3 > div > ul > li:nth-child(${i}) > div > a > img`,
        imagem => imagem.src
      )
      /* const nome = await page.$eval(
        `#marmita-panel1-3 > div > ul > li:nth-child(${i}) > div > a > img`, imagem =>imagem.alt
      )
      */

      const img = await page.$eval(
        `#marmita-panel1-3 > div > ul > li:nth-child(${i}) > div > a > div.dish-card__container-image > img`,
        imagem => imagem.src
      )
      var status = ""

      if (
        (await page.$(
          `#marmita-panel1-3 > div > ul > li:nth-child(${i}) > div > a > span`
        )) !== null
      ) {
        status = await page.$eval(
          `#marmita-panel1-3 > div > ul > li:nth-child(${i}) > div > a > span`,
          ver => ver.innerText
        )
      }
      total.toFixed(2)

      //arrayProducts.push({link:link,titulo:title,desc:description,nome:nome,preco:price,tempo:tempo,entrega:entrega,logo:logo,img:img,status:status,total:total})
      arrayProducts.push({
        link: link,
        titulo: title,
        desc: description,
        tempo: tempo,
        logo: logo,
        img: img,
        status: status,
        total: total,
      })
    }
    context.close()

    res.send(arrayProducts)
    console.log(arrayProducts)
    return arrayProducts
  } catch (err) {
    context.close()
    console.log(err)
    res.send(
      "Algo deu errado, confirme se você digitou corretamente o endereço e a comida desejada",
      err
    )
  }
})
