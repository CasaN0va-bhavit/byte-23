// FuKIrzktaQ2qOYWK
const mongoose = require('mongoose')

// HQzl4mcwodpeXin7

mongoose.connect("mongodb+srv://bhavitgrover:FuKIrzktaQ2qOYWK@cluster0.wvz78ir.mongodb.net/?retryWrites=true&w=majority")
.then(() => {
    console.log("Mongo Connected");
})
.catch(() => {
    console.log("failed you loser");
})


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
})



const Money = mongoose.model('Money', userSchema);

module.exports = Money