require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/persons')

// Express json-parser
app.use(express.json())
app.use(express.static('dist'))
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :req-body'
  )
)
app.use(cors())

// create custom token for morgan for response body
morgan.token('req-body', (request) => {
  return JSON.stringify(request.body)
})

// ROUTE FOR HOME
app.get('/', (request, response) => {
  response.send('<h1>Testing</h1>')
})

// ROUTE TO GET ALL PHONEBOOK
app.get('/api/persons', (request, response) => {
  Person.find({}).then((result) => {
    response.json(result)
  })
})

// ROUTE TO GET SPECIFIC PHONEBOOK
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((result) => {
      if (result) response.json(result)
      else response.status(404).end()
    })
    .catch((error) => next(error))
})

// DELETE ROUTE
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      if (result) {
        response.status(204).end()
      } else {
        const error = new Error('ID not Found')
        error.name = 'NotFoundError'
        throw error
      }
    })
    .catch((error) => {
      next(error)
    })
})

// CREATE/POST ROUTE
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const persons = new Person({
    name: body.name,
    number: body.number,
  })

  persons
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

// PUT ROUTE
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  if (!name || !number) {
    const error = new Error('Missing name or number')
    error.name = 'ValidationError'
    throw error
  } else if (!/^\d{2,3}-\d{7,8}$/.test(number)) {
    const error = new Error(
      'Invalid number format. Please use the format 000-0000000 or 000-00000000'
    )
    error.name = 'ValidationError'
    throw error
  }

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

// INFO ROUTE
app.get('/info', async (request, response) => {
  const date = new Date().toLocaleString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'long',
    timeZone: 'Asia/Manila',
  })
  const phonebookLength = await Person.countDocuments({})
  response.send(
    `<p>Phonebook has info for ${phonebookLength} people</p>
     <p>${date}</p>`
  )
})

// Middleware for unknown endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown Endpoint' })
}

app.use(unknownEndpoint)

// Middleware for error handling
const errorHandler = (error, request, response, next) => {

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' })
  } else if (error.name === 'NotFoundError') {
    return response.status(404).send({ error: 'Id Not Found' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

// PORT
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`)
})

/*
=================================================================
REFERENCE CODE (Previous Implementations)
=================================================================

// Process Arguments Check
if (process.argv.length > 5) {
  console.log(
    'You must enclose your value to string if the value of argument 4 or 5 have spaces (e.g, Tony Stark - "Tony Stark")'
  );
  process.exit(1);
} else if (process.argv.length > 3) {
  console.log(process.argv.length);
  console.log(`arguments: arg4: ${process.argv[3]} arg5: ${process.argv[4]}`);
} else if (process.argv.length <= 3) {
  console.log(`argumemts: ${process.argv[2]}`);
}

// Previous GET specific phonebook implementation
const id = request.params.id;
const specificPhone = phonebook.find((phone) => phone.id === id);

if (!specificPhone) {
  response
    .status(404)
    .send("Your specified Phonebook is missing or not found");
} else {
  response.json(specificPhone);
}

// Previous DELETE implementation
const id = request.params.id;
phonebook = phonebook.filter((phone) => phone.id !== id);
response.status(204).send(phonebook).end();

// Previous ID generator
const generateId = () => {
  const id = Math.floor(Math.random() * 1000 + 1);
  return id;
};

// Previous POST implementation
const found = phonebook.find(
  (phone) => phone.name.toLowerCase() === body.name.toLowerCase()
);

if (found) {
  response.json({ error: "Name Already Exist on the phonebook" });
} else if (body.name === "" || body.number === "") {
  response.json({ error: "Missing number or name" });
} else {
  const phone = {
    id: String(generateId()),
    name: body.name,
    number: body.number,
  };

  phonebook = phonebook.concat(phone);

  response.json(phonebook);
}


// let phonebook = [
//   {
//     id: "1",
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: "2",
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: "3",
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: "4",
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ];

*/
