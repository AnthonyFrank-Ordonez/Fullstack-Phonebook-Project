const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

// Express json-parser
app.use(express.json());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :req-body"
  )
);
app.use(cors());

// create custom token for morgan for response body
morgan.token("req-body", (request, _) => {
  return JSON.stringify(request.body);
});

let phonebook = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// ROUTE FOR HOME
app.get("/", (request, response) => {
  response.send("<h1>Testing</h1>");
});

// ROUTE TO GET ALL PHONEBOOK
app.get("/api/persons", (request, response) => {
  response.send(phonebook);
});

// ROUTE TO GET SPECIFIC PHONEBOOK
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const specificPhone = phonebook.find((phone) => phone.id === id);

  if (!specificPhone) {
    response
      .status(404)
      .send("Your specified Phonebook is missing or not found");
  } else {
    response.json(specificPhone);
  }
});

// DELETE ROUTE
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  phonebook = phonebook.filter((phone) => phone.id !== id);

  response.status(204).send(phonebook).end();
});

// GENERATE ID
const generateId = () => {
  const id = Math.floor(Math.random() * 1000 + 1);
  return id;
};

// CREATE/POST ROUTE
app.post("/api/persons", (request, response) => {
  const body = request.body;

  // Error handling if the name oor phone is missing
  if (!body.name || !body.number) {
    return response.json({
      error: "Missing Body Contents (e.g. name, number)",
    });
  }

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
});

// INFO ROUTE
app.get("/info", (request, response) => {
  const date = new Date().toLocaleString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour12: false,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "long",
    timeZone: "Asia/Manila",
  });
  const phoneBookLength = phonebook.length;
  response.send(
    `<p>Phonebook has info for ${phoneBookLength} people</p>
     <p>${date}</p>`
  );
});

// PORT
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
