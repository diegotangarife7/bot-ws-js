const mongoose = require("mongoose");
const { Client, RemoteAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { MongoStore } = require("wwebjs-mongo");
const listMessage = require("./controllers/listMessages");
require("dotenv").config();
mongoose
  .connect(process.env.MONGODB_CNN, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
      authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 300000,
      }),
    });

    client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
    });

    client.on("ready", () => {
      console.log("Client is ready!");
      listMessage(client);
    });

    client.on("remote_session_saved", () => {
      console.log("Remote session saved!");
    });

    client.initialize();
  });

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("DB esta conectada correctamente");
});
