const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://fullstack:${password}@cluster0.w6tnp3q.mongodb.net/phoneApp?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});
const Person = mongoose.model("Person", personSchema);

const parameriNimi = process.argv[3];
const parameriNumero = process.argv[4];
console.log("-------------");

if (process.argv.length < 4) {
  console.log("phonebook:");
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person.name, " ", person.number);
    });
    console.log("-------------");
    mongoose.connection.close();
  });
} else {
  const person = new Person({
    name: parameriNimi,
    number: parameriNumero || "xx-xxxxxx",
  });

  person.save().then((result) => {
    console.log(`added ${parameriNimi} number ${parameriNumero} to phonebook`);
    console.log("-------------");
    mongoose.connection.close();
  });
}
