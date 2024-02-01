const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const Person = require("./models/person");

const morgan = require("morgan");

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(cors());
app.use(express.json());
//app.use(morgan("tiny"));
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      JSON.stringify(req.body, null),
    ].join(" ");
  })
);
app.use(express.static("dist"));

let kpl = 0;

// Info-sivulle kappalemäärä...
function kuiPalOllenkka() {
  Person.find({}).then((persons) => {
    kpl = persons.length;
  });
}

// Juuren tervehdys...
app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

// Info-sivun tervehdys...
app.get("/info", (request, response) => {
  kuiPalOllenkka();
  const infoTexti =
    "<p>Phonebook has info for " +
    kpl +
    " people</p>" +
    "<p>" +
    Date() +
    "</p>";
  response.send(infoTexti);
});

// Haetaan kaikki...
app.get("/api/persons", (request, response) => {
  //console.log("Haetaan koko puhelinmuistio");
  Person.find({}).then((persons) => {
    response.json(persons);
    kuiPalOllenkka();
  });
});

// Haetaan henkilö ID:llä...
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// Lisätään uusi henkilö...
app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  //console.log("Lisätään henkilö: ", body);

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
      kuiPalOllenkka();
    })
    .catch((error) => next(error));
});

// Päivitetään henkilön tiedot
app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;
  //console.log("Päivitetään henkilö: ", request.body);

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

// Poistetaan henkilö ID:llä...
app.delete("/api/persons/:id", (request, response, next) => {
  //console.log("Poistetaan henkilö id:llä ", request.params.id);
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
      kuiPalOllenkka();
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
