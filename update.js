require("dotenv").config();
// const https = require("node:https");
// const axios = require("axios");

const { URL_BC } = process.env;
const url = `${URL_BC}`;
// const url = "https://www.google.com/";

const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1024 });

  page.on("response", async (response) => {
    if (response.request().resourceType() === "xhr") {
      if (response.url().includes("ajax-home-next-games/X0/1/")) {
        const data = await response.text();
        console.log(data);
      }
    }
  });

  await page.goto(url);

  const cookies = JSON.stringify(await page.cookies());
  const sessionStorage = await page.evaluate(() =>
    JSON.stringify(sessionStorage)
  );
  const localStorage = await page.evaluate(() => JSON.stringify(localStorage));

  console.log("🚀 ~ file: update.js:18 ~ cookies:", await cookies);
  console.log(
    "🚀 ~ file: update.js:22 ~ sessionStorage:",
    await sessionStorage
  );
  console.log("🚀 ~ file: update.js:24 ~ localStorage:", await localStorage);
})();

// const instance = axios.create({
//   baseURL: `${URL_BC}`,
//   timeout: 1000,
//   headers: {
//     "X-Requested-With": "XMLHttpRequest",
//     "User-Agent":
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
//   },
//   httpsAgent: new https.Agent({ keepAlive: true }),
// });

// const test = instance.get("/");
// test.then((res) => console.log("test", res.headers));

const mainUpdate = async () => {
  return [];
};

module.exports = { mainUpdate };
