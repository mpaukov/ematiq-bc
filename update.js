const createBrowserless = require("browserless");
const getHTML = require("html-get");
const { parse } = require("node-html-parser");
require("dotenv").config();

const { URL_BC } = process.env;

// Spawn Chromium process once
const browserlessFactory = createBrowserless();

// Kill the process when Node.js exit
process.on("exit", () => {
  console.log("closing resources!");
  browserlessFactory.close();
});

const getContent = async (url) => {
  // create a browser context inside Chromium process
  const browserContext = browserlessFactory.createContext();
  const getBrowserless = () => browserContext;
  const result = await getHTML(url, { getBrowserless });
  // close the browser context after it's used
  await getBrowserless((browser) => browser.destroyContext());
  return result;
};

const updateData = async () => {
  return getContent(`${URL_BC}/matches/tennis`)
    .then((content) => {
      //   console.log(content.html);
      //process.exit();
      let linksArray = [];
      const root = parse(content.html);
      linksArray = [
        ...new Set(
          root
            .getElementsByTagName("A")
            .map((element) => element.getAttribute("href"))
            .filter((element) => /^\/tennis\/\S+\/\S+\/\S+/gm.test(element))
        ),
      ];
      return linksArray;
    })

    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
};

async function getData(links) {
  if (links.length == 0) {
    return;
  }
  const link = links.shift();

  return getContent(`${URL_BC}${link}`)
    .then((content) => {
      const root = parse(content.html);
      const payout = root
        .getElementsByTagName("P")
        .filter((element) => element.rawAttrs == 'class="height-content"')
        .map((element) => element.textContent);
      const time = root
        .getElementsByTagName("DIV")
        .filter((element) => element.rawAttrs.includes("bg-event-start-time"))
        .map((element) => element.nextSibling.textContent);
      const title = root
        .getElementsByTagName("P")
        .filter((element) => element.rawAttrs.includes("truncate"))
        .map((element) => element.textContent);

      if (
        title.length > 0 &&
        title.length < 3 &&
        time.length > 0 &&
        payout.length > 0 &&
        payout[3].length > 0 &&
        payout[4].length > 0 &&
        time.toString().toLowerCase().includes("today")
      ) {
        const calc =
          (parseFloat(payout[3]) * parseFloat(payout[4]) * 100) /
          (parseFloat(payout[3]) + parseFloat(payout[4]));

        if (calc >= 98) {
          data.push({
            title: title.join(" --- "),
            time: time,
            payout: calc.toFixed(2) + "%",
          });
        }
      }
      return links;
    })
    .then((links) => {
      return getData(links);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

let data = [];

const mainUpdate = async () => {
  data = [];
  const links = await updateData();
  await getData(links);
  return data;
};

module.exports = { mainUpdate };
