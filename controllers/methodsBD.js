const Mensaje = require('../models/messages');

const saveMessage = async (from,number,categoria,busqueda) =>{
    let newMessage
    try {
        if(categoria){
            newMessage = new Mensaje({
                from,
                numberMessage:number,
                categoria
            });
        }else if(busqueda){
            newMessage = new Mensaje({
                from,
                numberMessage:number,
                busqueda
            });            
        }else{
            newMessage = new Mensaje({
                from,
                numberMessage:number
            });
         }
        await newMessage.save();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const deleteAllMessages = async (from) =>{
    try {
        await Mensaje.deleteMany({from: from})
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = {
    saveMessage,
    deleteAllMessages
}
