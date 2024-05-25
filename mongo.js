const mongoose = require('mongoose')



const password = process.argv[2]

const url = `mongodb+srv://contact:${password}@cluster0.d2ndv59.mongodb.net/ContactsCol?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set("strictQuery", false)

mongoose.connect(url)



const contactSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Contact = mongoose.model('Contact', contactSchema)

const contact =  new Contact({
    name: process.argv[3],
    number: process.argv[4]
})

if (process.argv.length < 5) {
   return displayContacts()
}
else{
    contact.save().then(result => {
        console.log(`Added ${contact.name} number ${contact.number} to the phonebook`)
        mongoose.connection.close()
    })
    return
}

 function displayContacts(){
    Contact.find({}).then(result => {
        console.log('Phonebook:')   
        result.forEach(element => {
            console.log(element)
        });
        mongoose.connection.close()
    })
    
}

