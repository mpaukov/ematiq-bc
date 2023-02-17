const ws = new require("ws");

const { mainUpdate } = require("./update");
require("dotenv").config();

const { PORT } = process.env;

const wsServer = new ws.Server({ port: PORT });

let clients = [];
let mainData = [];

wsServer.on("connection", (newClient) => {
  clients.push(newClient);
  newClient.send(JSON.stringify(mainData));

  newClient.on("close", () => {
    clients = clients.filter((s) => s !== newClient);
  });
});

const update = async () => {
  const newData = await mainUpdate();

  //   mainData = [...newData];
  //   if (mainData.length == 0) {
  //     try {
  //       update();
  //     } catch (error) {
  //       console.log("Error", error);
  //       update();
  //     }
  //     return;
  //   }
  //   if (clients.length > 0) {
  //     clients.forEach((client) => {
  //       client.send(JSON.stringify(mainData));
  //     });
  //   }

  //   const timerID = setTimeout(() => {
  //     try {
  //       update();
  //     } catch (error) {
  //       console.log("Error", error);
  //       clearTimeout(timerID);
  //       update();
  //     }
  //   }, 60000);
};

try {
  update();
} catch (error) {
  console.log("Error", error);
  update();
}
