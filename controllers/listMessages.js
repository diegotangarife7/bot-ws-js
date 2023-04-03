const Mensaje = require("../models/messages");
const Comerciantes = require("../models/comerciantes");
const Categoria = require("../models/categoria");
const { saveMessage, deleteAllMessages } = require("./methodsBD");

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
          "¡Hola, espero que estés bien!, A continuación te proporcionaré una lista de categorías, por favor escribe la categoría a la que pertenece tu producto."
        );
        setTimeout(() => {
          categoriasDisponibles.forEach(function (objeto) {
            sendMessage(client, from, objeto.categoria);
          });
        }, 4000);
        return;
      }
      if (messagesTwo.length === 0) {
        console.log(categorias,body)
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
                "Ocurrió un problema al guardar la opción, por favor vuelve a seleccionar"
              );
        } else {
          sendMessage(
            client,
            from,
            "Por favor, escribe una categoría existente"
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
              "Estás seguro de tu búsqueda?, escribe 'sí' si estás seguro de la orden o 'no' si quieres repetir el proceso"
            )
          : sendMessage(
              client,
              from,
              "Ocurrió un problema al guardar la búsqueda, por favor vuelve a escribirla."
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
          console.log(messageBusqueda, messageCategoria);
          const comerciantes = await Comerciantes.find({
            categoria: messageCategoria[0].categoria,
          });
          resultDelete = await deleteAllMessages(from);
          console.log(comerciantes, resultDelete)
          if (resultDelete) {
            comerciantes.forEach(function (objeto) {
              const indiceArroba = from.indexOf("@");
              const numeroSinPrefijo = from
                .replace("57", "")
                .substring(0, indiceArroba);
              sendMessage(
                client,
                objeto.number,
                `¡Hola! Acabamos de recibir una solicitud de [${messageBusqueda[0].busqueda}] del numero 57${numeroSinPrefijo} Te envío el enlace directo para que puedas ponerte en contacto con él y hablar sobre sus necesidades: https://api.whatsapp.com/send?phone=57${numeroSinPrefijo}`
              );
            });
            sendMessage(
              client,
              from,
              "¡Gracias por tu solicitud! Pronto recibirás noticias de nuestros negocios aliados, quienes se pondrán en contacto contigo"
            );
          } else {
            sendMessage(
              client,
              from,
              "Ocurrió un error, por favor escribe de nuevo 'sí' si estás seguro de la orden o 'no' si quieres repetir el proceso"
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
              "Por favor escribe la categoría a la que pertenece tu producto."
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
            "Esta opción no existe, por favor escribe 'sí' si estás seguro de la orden o 'no' si quieres repetir el proceso"
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

module.exports = listMessage;
