const http = require("http")
const {json} = require("stream/consumers")
const cors = require("cors")
const morgan = require("morgan")

morgan.token("body", (req, res) => JSON.stringify(req.body))
require("dotenv").config()

const mongoose = require("mongoose")
const express = require("express")
const {error} = require("console")
const app = express()
const Contact = require("./contact")

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static("dist"))

let contacts = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

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

    const body = request.body

    const note = {
        name: body.name,
        number: body.number
    }

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

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === "CastError"){
        return response.status(400).json({error: "bad id request"})
    }else if (error.name === "ValidationError"){
        return response.status(400).json({error: error.message})
    }
}

app.use(errorHandler)