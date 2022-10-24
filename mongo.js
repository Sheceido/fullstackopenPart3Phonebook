const mongoose = require('mongoose');

if ( process.argv.length !== 3 && process.argv.length !== 5) {
    console.log("incorrect command line input parameters:");
    console.log("'node mongo.js <your password> <opt1: newName> <opt1: newNumber>'");
    process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://lpoon:${password}@fsopart3.ff5da4p.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

const phonebookSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Contact = mongoose.model('Contact', phonebookSchema);

// Retrieve data from database
if (process.argv.length === 3) {

    mongoose
        .connect(url)
        .then((result) => {
          
            Contact
                .find({})
                .then(result => {
                    console.log("phonebook:");
                    result.forEach( (contact) => {
                        console.log(`${contact.name} ${contact.number}`);
                    });

                    mongoose.connection.close();
                })
                .catch(error => console.log(error));
        })
        .catch(error => console.log(error));
}

// Add new person to phonebook
if (process.argv.length === 5) {

    const newName = process.argv[3];
    const newNumber = process.argv[4];

    const newContact = new Contact({
        name: newName,
        number: newNumber
    });

    mongoose
        .connect(url)
        .then(result => {
            console.log('db connected! Saving new contact information...');
            return newContact.save();
        })
        .then(() => {
            console.log(`added ${newName} number ${newNumber} to phonebook.`);
            console.log('closing connection!');
            mongoose.connection.close();
        })
        .catch(error => console.log(error));
}