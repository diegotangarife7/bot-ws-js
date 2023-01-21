const {Schema,model} = require('mongoose');
const comercieanteSchema = new Schema({
    number:  {
        type: String,
        required : true,
    },
    categoria:  {
        type: Schema.Types.ObjectId,
        ref: 'Categoria',
        required: true
    },
    pago: {
        type: Boolean,
        required : true,
    }
}
);

comercieanteSchema.method('toJSON', function(){
    const { __V, _id, ...object} = this.toObject();
    object.cmr = _id;
    return object;
})

module.exports = model('Comerciante', comercieanteSchema);