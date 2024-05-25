require("http")
require("stream/consumers")
const cors = require("cors")
const morgan = require("morgan")

morgan.token("body", (req) => JSON.stringify(req.body))
require("dotenv").config()

require("mongoose")
const express = require("express")
require("console")
const app = express()
const Contact = require("./contact")

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static("dist"))


app.get("/api/persons", (request, response) => {
    Contact.find({}).then(contact => {
        response.json(contact)
    })
})

app.get("/api/info", (request, response) => {

    Contact.find({}).then(contact => {
        response.send(
            `<p>Phonebook has info for ${contact.length} people</p>
            <br/>
            <p>${new Date()}</p>`)
    })
 
})

app.get("/api/persons/:id", (request, response, next) => {
    Contact.findById(request.params.id).then(contact => {
        response.json(contact)
    }).catch(error => next(error)) 
})

app.delete("/api/persons/:id", (request, response, next) => {
    Contact.findByIdAndDelete(request.params.id).then(contact => {
        console.log(`Deleted ${contact.name} number ${contact.number} from the phonebook`)
        response.status(204).end()
    }).catch(error => next(error)) 
    
})

app.post("/api/persons", (request, response, next) => {
    const body = request.body
    console.log(request.body)
    if(body.content){
        response.status(400).json({"error": "Missing content"})
    } 
    
    const contact = new Contact({   
        name: body.name,
        number: body.number
    })

    contact.save().then(result => {
        console.log(`Added new contact to the DB: Name: ${contact.name} Number: ${contact.number}`)
        response.status(200).json(result)
    }).catch(error => next(error))  

})

app.put("/api/persons/:id", (request, response, next) => {
    const {name, number} = request.body

    Contact.findByIdAndUpdate(request.params.id, {name, number},
        {new: true, runValidators: true, context: "query"})
    .then(updateContact => {
        response.json(updateContact)
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT 
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({error: "unknown endpoint"})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response) => {
    console.error(error.message)

    if (error.name === "CastError"){
        return response.status(400).json({error: "bad id request"})
    }else if (error.name === "ValidationError"){
        return response.status(400).json({error: error.message})
    }
}

app.use(errorHandler)