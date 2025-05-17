import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    products: {
        type: [
            {
                product: {type: mongoose.Schema.Types.ObjectId, ref: 'products'},
                quantity: {type: Number, required: true}
            }
        ],
        default: []
    }
})

export const cartModel = mongoose.model('cart', cartSchema);
