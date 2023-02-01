const ws = new require("ws");
const { parse } = require("node-html-parser");
const createBrowserless = require("browserless");
const getHTML = require("html-get");

const wsServer = new ws.Server({ port: 5000 });

let clients = [];
let timeoutId;
let data = [];
let linksArray = [];

wsServer.on("connection", (newClient) => {
  clients.push(newClient);
  if (clients.length === 1) {
    updateData();
  }
  newClient.on("close", () => {
    clients = clients.filter((s) => s !== newClient);
    if (clients.length === 0) {
      clearTimeout(timeoutId);
    }
  });
});

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

function updateData() {
  getContent("https://www.oddsportal.com/matches/tennis")
    .then((content) => {
      //   console.log(content.html);
      //process.exit();
      const root = parse(content.html);
      linksArray = [
        ...new Set(
          root
            .getElementsByTagName("A")
            .map((element) => element.getAttribute("href"))
            .filter((element) => /^\/tennis\/\S+\/\S+\/\S+/gm.test(element))
        ),
      ];

      let i = 0;

      getData(i);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });

  function getData(index) {
    if (index < linksArray.length) {
      getContent(`https://www.oddsportal.com${linksArray[index]}`)
        .then((content) => {
          const root = parse(content.html);
          const payout = root
            .getElementsByTagName("P")
            .filter((element) => element.rawAttrs == 'class="height-content"')
            .map((element) => element.textContent);
          const time = root
            .getElementsByTagName("DIV")
            .filter((element) =>
              element.rawAttrs.includes("bg-event-start-time")
            )
            .map((element) => element.nextSibling.textContent)
            .join(" ");

          const title = root
            .getElementsByTagName("P")
            .filter((element) => element.rawAttrs.includes("truncate"))
            .map((element) => element.textContent)
            .join(" --- ");

          data.push({
            title: title,
            time: time,
            payout: payout,
          });
          console.log("data", data);
          clients.forEach((client) => {
            client.send(JSON.stringify(data));
          });
        })
        .catch((error) => {
          console.error(error);
          process.exit(1);
        });
    } else {
      return;
    }
    setTimeout(() => {
      getData(++index);
    }, 5000);
  }

  //   timeoutId = setTimeout(() => {
  //     updateData();
  //   }, 3000);
}
