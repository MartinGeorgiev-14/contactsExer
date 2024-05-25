const mongoose = require('mongoose')

mongoose.set("strictQuery", false)

const url = process.env.MONGODB_URI

console.log("connecting to: " , url)

mongoose.connect(url)
    .then(result => {
        console.log("connected to MongoDB")
    }).catch(err => {
        console.log("error connecting to MongoDB: ", err.message)
    });

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: [3, "name must contain at least 3 characters"],
        required: true,
    },
    number: {
        type: String,
        validate: {
            validator: function(n) {
                return /^(\d{2}-\d{6,}|\d{3}-\d{5,})$/.test(n);
            },
            message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, "User phone number is required"],
    }
});

contactSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model("Contact", contactSchema)
