const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

//app.use(morgan("tiny"));
//app.use(morgan("dev"));
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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// Juuren tervehdys...
app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

// Info-sivun tervehdys...
app.get("/info", (request, response) => {
  const infoTexti =
    "<p>Phonebook has info for " +
    persons.length +
    " people</p>" +
    "<p>" +
    Date() +
    "</p>";
  response.send(infoTexti);
});

// Haetaan kaikki...
app.get("/api/persons", (request, response) => {
  console.log("Haettiin koko puhelinmuistio");
  response.json(persons);
});

// Haetaan henkilö ID:llä...
app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  //const id = request.params.id;
  console.log("Haetaan henkilö id:llä... ", id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    console.log("... henkilö on ", person);
    response.json(person);
  } else {
    console.log("... No ei sitä löydy! ");
    response.status(404).end();
  }
});

// ID:n muodostus...
function getRndInteger() {
  let min = persons.length + 1;
  let max = persons.length + 1000;

  return Math.floor(Math.random() * (max - min + 1)) + min;
  //return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

function pieniksi(merkit) {
  return merkit.toLowerCase();
}

// Lisätään uusi henkilö...
app.post("/api/persons", (request, response) => {
  const body = request.body;
  //console.log(request.headers);
  console.log("Lisätään henkilö: ", body);

  switch (true) {
    case !body.name:
      console.log("... no, ei lisätä! Ei oo nimee...  ");
      return response.status(400).json({
        error: "name missing",
      });
    case !body.number:
      console.log("... no, ei lisätä! Ei oo numeroo...  ");
      return response.status(400).json({
        error: "number missing",
      });
  }

  const muistionKaikkiNimet = persons.map((x) => pieniksi(x.name));
  const onJoMuistiossa = muistionKaikkiNimet.includes(pieniksi(body.name));
  console.log("onJoMuistiossa?", onJoMuistiossa);
  if (onJoMuistiossa) {
    console.log("... no, ei lisätä! On jo muistiossa...  ", body.name);
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const persoona = {
    id: getRndInteger(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(persoona);
  console.log("... no, lisättiin  ", persoona);
  response.json(persoona);
});

// Poistetaan henkilö ID:llä...
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  //const id = request.params.id;
  console.log("Poistetaan henkilö id:llä ", id);
  persons = persons.filter((person) => person.id !== id);
  console.log("... persoonat nyt", persons);

  response.status(204).end();
});

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
