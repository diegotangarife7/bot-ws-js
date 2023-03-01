const fs = require("fs");
const { Client, NoAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const SESSION_WHATSAPP = "./session.json";
const Mensaje = require("./models/messages");
const Comerciantes = require("./models/comerciantes");
const Categoria = require("./models/categoria");
require("./database");
const { saveMessage, deleteAllMessages } = require("./controllers/methodsBD");

let client;
let sessionData;

const withSession = () => {
  console.log("validando sesion con whatsapp ...");
  sessionData = require(SESSION_WHATSAPP);

  client = new Client({
    session: sessionData,
  });

  client.on("ready", () => {
    console.log("cliente esta listo");
    listMessage();
  });

  client.on("auth_failure", () => {
    spinner.stop();
    console.log("sucedio un error en la ejecucion");
  });

  client.initialize();
};

const listMessage = (client) => {
  client.on("message", async (msg) => {
    let resultSave;
    let resultDelete;
    const { from, to, body } = msg;
    try {
      const messages = await Mensaje.find({ from });
      const categoriasDisponibles = await Categoria.find();
      const categorias = categoriasDisponibles.map((categoria) => {
        return categoria.categoria;
      });
      const messagesOne = messages.filter(
        (message) => message.numberMessage === 1
      );
      const messagesTwo = messages.filter(
        (message) => message.numberMessage === 2
      );
      const messagesThree = messages.filter(
        (message) => message.numberMessage === 3
      );
      if (messagesOne.length === 0) {
        saveMessage(from, 1);
        sendMessage(
          client,
          from,
          "buen dia, por favor escribe una de las siguientes opciones"
        );
        setTimeout(() => {
          categoriasDisponibles.forEach(function (objeto) {
            sendMessage(client, from, objeto.categoria);
          });
        }, 4000);
        return;
      }
      if (messagesTwo.length === 0) {
        if (categorias.includes(body.toLowerCase())) {
          resultSave = saveMessage(
            from,
            2,
            categoriasDisponibles[categorias.indexOf(body.toLowerCase())]._id
          );
          resultSave
            ? sendMessage(
                client,
                from,
                `Escribe el nombre del producto relacionado con la categoria que acabaste de seleccionar: ${body.toLowerCase()}`
              )
            : sendMessage(
                client,
                from,
                "ocurrio un problema al guardar la opcion, por favor vuelve a seleccionar"
              );
        } else {
          sendMessage(
            client,
            from,
            "Por favor, selecciona un campo de los anteriores mensionados"
          );
        }
        return;
      }
      if (messagesThree.length === 0) {
        resultSave = saveMessage(from, 3, false, body);
        resultSave
          ? sendMessage(
              client,
              from,
              "estas seguro de tu busqueda?, escribe 'si' si estas seguro de la orden o 'no' si quieres repetir el proceso"
            )
          : sendMessage(
              client,
              from,
              "ocurrio un problema al guardar la busqueda, por favor vuelve a escribirla"
            );
        return;
      }
      switch (body.toLowerCase()) {
        case "si":
          const messageCategoria = await Mensaje.find({
            from,
            numberMessage: 2,
          });
          const messageBusqueda = await Mensaje.find({
            from,
            numberMessage: 3,
          });
          console.log(messageBusqueda)
          console.log(messageBusqueda, messageCategoria);
          const comerciantes = await Comerciantes.find({
            categoria: messageCategoria[0].categoria,
          });
          resultDelete = deleteAllMessages(from);
          if (resultDelete) {
            comerciantes.forEach(function (objeto) {
              const indiceArroba = from.indexOf("@");
              const numeroSinPrefijo = from
                .replace("57", "")
                .substring(0, indiceArroba);
              sendMessage(
                client,
                objeto.number,
                `el numero 57${numeroSinPrefijo} esta solicitando [${messageBusqueda[0].busqueda}] te comparto link directo para hablar con el: https://api.whatsapp.com/send?phone=57${numeroSinPrefijo}`
              );
            });
            sendMessage(
              client,
              from,
              "muchas gracias por tu solicitud, dentro de poco tiempo nuestros negocios aliados se pondran en contacto contigo"
            );
          } else {
            sendMessage(
              client,
              from,
              "ocurrio un error, por favor escribe de nuevo 'si' si estas seguro de la orden o 'no' si quieres repetir el proceso"
            );
          }
          break;
        case "no":
          resultDelete = deleteAllMessages(from);
          if (resultDelete) {
            const categoriasDisponibles = await Categoria.find();
            saveMessage(from, 1);
            sendMessage(
              client,
              from,
              "buen dia, por favor selecciona una de las siguientes opciones"
            );
            setTimeout(() => {
              categoriasDisponibles.forEach(function (objeto) {
                sendMessage(client, from, objeto.categoria);
              });
            }, 4000);
          }
          break;
        default:
          sendMessage(
            client,
            from,
            "esta opcion no existe, por favor escribe 'si' si estas seguro de la orden o 'no' si quieres repetir el proceso"
          );
          break;
      }
    } catch (error) {
      console.log(error);
    }
  });
};

const sendMessage = (client, to, msg) => {
  try {
    client.sendMessage(to, msg);
    return true;
  } catch (error) {
    return false;
  }
};

const withOutSession = () => {
  const client = new Client({
    authStrategy: new NoAuth(),
  });
  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("Client is ready!");
    listMessage(client);
  });

  client.initialize();
};

fs.existsSync(SESSION_WHATSAPP) ? withSession() : withOutSession();
