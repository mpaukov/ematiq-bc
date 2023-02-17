require("dotenv").config();
// const https = require("node:https");
// const axios = require("axios");

const { URL_BC } = process.env;
const url = `${URL_BC}`;

const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: "./.temp",
  });

  const page = await browser.newPage();
  await page.tracing.start({
    // categories: ["devtools.timeline"],
    path: "./.temp/.tracing.json",
  });

  await page.goto(url, { options: { waitUntil: "load" } });

  // await page.goto("https://developer.chrome.com/");

  // Set screen size
  await page.setViewport({ width: 1400, height: 1024 });
  const cookies = JSON.stringify(await page.cookies());
  const sessionStorage = await page.evaluate(() =>
    JSON.stringify(sessionStorage)
  );
  const localStorage = await page.evaluate(() => JSON.stringify(localStorage));

  // console.log("cookies", cookies);
  // console.log("sessionStorage", sessionStorage);
  // console.log("localStorage", localStorage);

  var tracing = JSON.parse(await page.tracing.stop());

  const ttt = tracing.traceEvents.filter(
    (te) => te.name === "ResourceReceiveResponse"
  );

  const ddd = ttt.filter((t) => t.args.data.mimeType.includes("png"));
  console.log("ddd.data", ddd);

  // let performanceTiming = JSON.parse(
  //   await page.evaluate(() => JSON.stringify(window.performance.getEntries()))
  // );

  // console.log(performanceTiming);

  // Type into search box
  // await page.type(".search-box__input", "automate beyond recorder");

  // Wait and click on first result
  // const searchResultSelector = ".search-box__link";
  // await page.waitForSelector(searchResultSelector);
  // await page.click(searchResultSelector);

  // Locate the full title with a unique string
  // const textSelector = await page.waitForSelector(
  //   "text/Customize and automate"
  // );
  // const fullTitle = await textSelector.evaluate((el) => el.textContent);

  // Print the full title
  // console.log('The title of this blog post is "%s".', fullTitle);

  // await browser.close();
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
