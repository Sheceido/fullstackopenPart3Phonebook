require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Contact = require("./models/contact");

const app = express();

app.use(express.static("build"));
app.use(express.json());
app.use(cors());

// custom token using morgan
morgan.token("json", function (req, ) {
  return JSON.stringify(req.body);
});
// implementing custom token within morgan for app to use
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"), "-",
      tokens["response-time"](req, res), "ms",
      tokens["json"](req, res),
    ].join(" ");
  })
);

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response, next) => {
  Contact
    .find({})
    .then(contacts => {
      response.json(contacts);
    })
    .catch(error => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error:"content missing" });
  }
  Contact
    .find({})
    .then(result => {

      if (result.find(p => p.name === body.name)) {
        return response.status(400).json({ error:"new contact name must be unique" });
      }
      const newPerson = new Contact({
        name: request.body.name,
        number: request.body.number,
      });
      newPerson
        .save()
        .then(savedContact => response.json(savedContact))
        .catch(error => next(error));
    })
    .catch(error => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  Contact
    .findById(request.params.id)
    .then(contact => response.json(contact))
    .catch(error => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;
  Contact
    .findByIdAndUpdate(
      request.params.id,
      { name, number },
      { new: true, runValidators: true, context: "query" }
    )
    .then(updatedContact => response.json(updatedContact))
    .catch(error => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Contact
    .findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch(error => next(error));
});

app.get("/info", (request, response, next) => {
  Contact
    .find({})
    .then(results => {
      response.send(`
            <p>Phonebook has info for ${results.length} people</p>
            <p>${new Date()}</p>`);
    })
    .catch(error => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint." });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  switch(error.name) {

  case "CastError":
    return response(400).send({ error: "malformatted id" });

  case "ValidationError":
    return response.status(400).json({ error: error.message });
  }
  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});