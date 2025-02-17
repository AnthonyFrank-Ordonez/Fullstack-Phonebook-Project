const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "Unable to run your command please specify a parameter e.g (node mongo.js <parameter2> <parameter 3> <parameter 4>)"
  );
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://afordonez:${password}@cluster0.d6mgi.mongodb.net/Phonebook?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length > 5) {
  console.log(
    'You must enclose your value to string if the value of argument 4 or 5 have spaces (e.g, Tony Stark - "Tony Stark")'
  );
  process.exit(1);
} else if (process.argv.length > 3) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  person.save().then((result) => {
    console.log(`Added ${result.name} number ${result.number} to phonebook`);
    mongoose.connection.close();
  });
} else if (process.argv.length <= 3) {
  Person.find({}).then((result) => {
    console.log("phonebook:");
    result.forEach((person) => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
}
