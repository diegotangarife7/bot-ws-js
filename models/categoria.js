const {Schema,model} = require('mongoose');
const categoriaSchema = new Schema({
    categoria:  {
        type: String,
        required: true
    },
}
);

categoriaSchema.method('toJSON', function(){
    const { __V, _id, ...object} = this.toObject();
    object.ctg = _id;
    return object;
})

module.exports = model('Categoria', categoriaSchema);