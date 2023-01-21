const fs = require('fs');   
const {Client} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const SESSION_WHATSAPP = "./session.json";
const Mensaje = require('./models/messages');
const Comerciantes = require('./models/comerciantes');
const Categoria = require('./models/categoria');
const ora = require('ora');
const chalk = require('chalk');
const { saveMessage, deleteAllMessages } = require('./controllers/methodsBD');
let client;
let sessionData;


const withSession = () =>{
    const spinner = ora(`cargando ${chalk.yellow("validando sesion con whatsapp ...")}`)
    sessionData = require(SESSION_WHATSAPP);
    spinner.start();

    client = new Client({
        session: sessionData
    });

    client.on("ready", () =>{
        console.log("cliente esta listo");
        spinner.stop();
        listMessage();
    });

    client.on("auth_failure", () =>{
        spinner.stop();
        console.log("sucedio un error en la ejecucion");
    });

    client.initialize();
}

const listMessage = () => {
    client.on("message",async (msg)=>{
        let resultSave;
        let resultDelete;
        const { from, to, body } = msg;
        const messages = await Mensaje.find({from});
        const categoriasDisponibles = await Categoria.find();
        const categorias = Array.from({length: categoriasDisponibles.length}, (_, i) => i + 1);
        const messagesOne = messages.filter(message => message.numberMessage === 1);
        const messagesTwo = messages.filter(message => message.numberMessage === 2);
        const messagesThree = messages.filter(message => message.numberMessage === 3);
        if(!messagesOne){
            saveMessage(from, 1);
            sendMessage(from,"buen dia, por favor selecciona una de las siguientes opciones");
            return
        }
        
        if(!messagesTwo){
            if(categorias.includes(body)){
                resultSave = saveMessage(from, 2, categoriasDisponibles[parseInt(body)].ctg);
                (resultSave)?sendMessage(from,"Ingresa tu busqueda relacionado con esta categoria"):sendMessage(from,"ocurrio un problema al guardar la opcion, por favor vuelve a seleccionar");
            }else{
                sendMessage(from,"Por favor, selecciona un campo de los anteriores mensionados");
            }
            return
        } 
        
        if(!messagesThree){
            resultSave = saveMessage(from, 3, false ,body);
            (resultSave)?sendMessage(from,"estas seguro de tu busqueda?, escribe 'si' si estas seguro de la orden o 'no' si quieres repetir el proceso" ):sendMessage(from,"ocurrio un problema al guardar la busqueda, por favor vuelve a escribirla");
            return
        }

        
        switch (body.toLowerCase()) {
            case "si":
                const messageCategoria = await Mensaje.find({from,numberMessage:2}); 
                const messageBusqueda = await Mensaje.find({from,numberMessage:3}); 
                const comerciantes = await Comerciantes.find({categoria:messageCategoria.categoria}); 
                resultDelete = deleteAllMessages(from);
                if(resultDelete){
                    comerciantes.forEach(function(objeto) {
                        sendMessage(objeto.number,`el numero ${from} esta solicitando ${messageBusqueda.busqueda}`);
                    });
                }else{
                    sendMessage(from,"ocurrio un error, por favor escribe de nuevo 'si' si estas seguro de la orden o 'no' si quieres repetir el proceso" );
                }
                break;
            case "no":
                resultDelete = deleteAllMessages(from);
                if(resultDelete){
                    saveMessage(from, 1);
                    sendMessage(from,"buen dia, por favor selecciona una de las siguientes opciones");
                }
                break;
            default:
                sendMessage(from,"esta opcion no existe, por favor escribe 'si' si estas seguro de la orden o 'no' si quieres repetir el proceso" );
                break;
        }


    });
}

const sendMessage = (to, msg) => {
    client.sendMessage(to,msg);
}

const withOutSession = () =>{

    client = new Client();
    client.on("qr",qr => {
        qrcode.generate(qr,{small:true});
    });

    client.on("authenticated", (session) => {
        sessionData = session;
        fs.writeFile(SESSION_WHATSAPP, JSON.stringify(session),function (err) {
        if(err){
            console.error(err);
        }
        });
        }
        );
    
}

(fs.existsSync(SESSION_WHATSAPP))?withSession():withOutSession();
