const fs = require('fs');   
const {Client} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const SESSION_WHATSAPP = "./session.json";
const ora = require('ora');
const chalk = require('chalk');
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
    });
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
