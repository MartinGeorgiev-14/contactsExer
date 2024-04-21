const http = require("http")
const {json} = require("stream/consumers")
const cors = require("cors")
const morgan = require("morgan")

morgan.token("body", (req, res) => JSON.stringify(req.body))

const express = require("express")
const {error} = require("console")
const app = express()
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

app.get("/api/persons", (request, response) => response.json(contacts))

app.get("/info", (request, response) => {
    const lenght = contacts.length
    const date = new Date()

    return response.send(
        `<p>Phonebook has info for ${lenght} people</p>
        <br/>
        <p>${date}</p>`)
})

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)

    contact = contacts.find(c => c.id === id)

    if(!contact){
        return response.status(404).end()
    }

    return response.json(contact)
})

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)

    if(!contacts.find(c => c.id === id)){
        return response.status(404).json({error: "Contant was not found"})
    }

    contacts = contacts.filter(c => c.id !== id)
    
    return response.status(204).end()
})

app.post("/api/persons", (request, response) => {
    
    const body = request.body
    const id = Math.round(Math.random() * (10000 - 1) + 1)
    const name = contacts.filter(c => c.name === body.name)
    console.log(name.length)
    if(!body.name || !body.number){
        return response.status(400).json({
            error: "content missing"
        })
    }
    else if(name.length === 1){
        return response.status(409).json({
            error: "contact already exists"
        })
    }

    const contact = {
        name: body.name,
        number: body.number,
        id: id
    }

    contacts = contacts.concat(contact)

    return response.json(contact)
})

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})