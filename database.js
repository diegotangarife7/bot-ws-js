const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect('mongodb+srv://AdminAll:Aa6NJXGM3TEmSugF@cluster0.b08dm.mongodb.net/db_bot-ws?authMechanism=DEFAULT', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("DB esta conectada correctamente");
});
