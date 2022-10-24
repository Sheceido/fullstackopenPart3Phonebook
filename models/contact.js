const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;
console.log("connecting to MongoDB...");

mongoose
  .connect(url)
  .then(() => {
    console.log("Connected!");
  })
  .catch(error => console.log("MongoDB connection error: ", error.message));

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: [true, "User name required"]
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function(v) {
        return /^\d{2,}[-]\d{6,}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, "User phone number required"]
  },
});

contactSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model("Contact", contactSchema);