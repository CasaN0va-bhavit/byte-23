const mongoose = require('mongoose')

// HQzl4mcwodpeXin7

mongoose.connect("mongodb+srv://bhavitgrover:yG4z2rNhVcmUuJ9U@login.2wdzjer.mongodb.net/?retryWrites=true&w=majority")
.then(() => {
    console.log("Mongo Connected");
})
.catch(() => {
    console.log("failed you loser");
})


const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required:true
    }
})



const Users = mongoose.model('Users', userSchema);

module.exports = Users