const {Schema,model} = require('mongoose');
const Mensaje = new Schema({
    from:  {
        type: String,
        required : true,
    },
    numberMessage:{
        type: Number,
        required : true,
    },
    categoria:  {
        type: Schema.Types.ObjectId,
        ref: 'Categoria',
    },
    busqueda:  {
        type: String
    },
},
{
    timestamps : true
});

Mensaje.method('toJSON', function(){
    const { __V, ...object} = this.toObject();
    return object;
})

module.exports = model('Mensaje', Mensaje);