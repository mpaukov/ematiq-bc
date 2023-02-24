const ws = new require("ws");
const puppeteer = require("puppeteer");
require("dotenv").config();

const { PORT, URL_BC, LOGIN, PASSWORD } = process.env;
const url = `${URL_BC}`;
const wsServer = new ws.Server({ port: PORT });

let clients = [];
let mainData = [];
let newMainData = [];

wsServer.on("connection", (newClient) => {
  clients.push(newClient);
  newClient.send(JSON.stringify(newMainData));

  newClient.on("close", () => {
    clients = clients.filter((s) => s !== newClient);
  });
});

const equalsCheck = (a, b) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

async function updateData() {
  // {
  //   headless: false;
  // }
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.setViewport({ width: 1440, height: 1024 });

  const connection = async () => {
    await page.goto(url);

    const loginBtn = ".loginModalBtn";
    await page.waitForSelector(loginBtn);
    await page.click(loginBtn);

    const loginInput = "input[name=login-username]";
    await page.waitForSelector(loginInput);
    await page.type(loginInput, `${LOGIN}`);

    const passwordInput = "input[name=login-password]";
    await page.waitForSelector(passwordInput);
    await page.type(passwordInput, `${PASSWORD}`);

    const submitBtn = "input[name=login-submit]";
    await page.waitForSelector(submitBtn);
    await Promise.all([page.click(submitBtn), page.waitForNavigation()]);
  };

  try {
    await connection();
  } catch (error) {
    console.log(error);
    setTimeout(async () => {
      await connection();
    }, 120000);
  }

  page.on("response", async (response) => {
    if (response.request().resourceType() === "xhr") {
      if (response.url().includes("/all.dat?_=")) {
        let data;
        try {
          data = JSON.parse(await response.text());
        } catch (error) {
          console.log(error);
        }
        if (data) {
          const myData = data.d.rows.map(
            ({
              "home-name": homeName,
              "away-name": awayName,
              "date-start-base": dateOfGame,
              homeResult,
              awayResult,
              odds,
            }) => {
              const highOdds = odds.map((odd) => odd.maxOdds);
              const payout = (
                (parseFloat(highOdds[0]) * parseFloat(highOdds[1]) * 100) /
                (parseFloat(highOdds[0]) + parseFloat(highOdds[1]))
              ).toFixed(2);
              return {
                homeName,
                awayName,
                date: dateOfGame,
                homeResult,
                awayResult,
                payout,
              };
            }
          );
          if (!equalsCheck(mainData, myData)) mainData = [...myData];
        }
      }
    }
  });

  const redirection = async () => {
    const allMatchesSelector = "a[href='/matches/my-matches/']";
    await page.waitForSelector(allMatchesSelector);
    await Promise.all([
      page.click(allMatchesSelector),
      page.waitForNavigation(),
    ]);
  };

  try {
    await redirection();
  } catch (error) {
    console.log(error);
    setTimeout(async () => {
      await redirection();
    }, 120000);
  }

  setInterval(() => {
    if (!equalsCheck(newMainData, mainData)) {
      newMainData = [...mainData];
      if (clients.length > 0) {
        clients.forEach((client) => {
          client.send(JSON.stringify(newMainData));
        });
      }
    }
    page.reload();
  }, 30000);
}

try {
  updateData();
} catch (error) {
  console.log(error);

  setTimeout(() => {
    updateData();
  }, 120000);
}
