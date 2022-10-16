const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(express.static('build'));
app.use(express.json());

// custom token using morgan
morgan.token('json', function (req, res) {
    return JSON.stringify(req.body)
});
// implementing custom token within morgan for app to use
app.use(
    morgan(function (tokens, req, res) {
        return [
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, 'content-length'), '-',
          tokens['response-time'](req, res), 'ms',
          tokens['json'](req, res),
        ].join(' ')
    })
);

// data
let phonebook = [
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

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>');
});

app.get('/api/persons', (request, response) => {
    response.json(phonebook);
});

app.post('/api/persons', (request, response) => {
    const body = request.body;
    
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        });
    }
    
    const duplicate = phonebook.find(p => p.name === body.name);
    if (duplicate) {
        return response.status(400).json({
            error: 'name must be unique'
        });
    }

    const newPerson = {
        id: generateID(),
        name: body.name,
        number: body.number,
    }
    phonebook = phonebook.concat(newPerson);
    response.json(newPerson);
});

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const personInfo = phonebook.find(p => p.id === id);
    
    personInfo
    ? response.json(personInfo)
    : response.status(404).end();
});

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    phonebook = phonebook.filter(p => p.id !== id);
    
    response.status(204).end();
});

app.get('/info', (request, response) => {
    response.send(`
    <p>Phonebook has info for ${phonebook.length} people</p>
    <p>${new Date()}</p>`);
});

const generateID = () => {
    const maxId = phonebook.length > 0
    ? Math.round(Math.random() * 1000000)
    : 0

    return maxId;
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Sever running on port ${PORT}`);
});