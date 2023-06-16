const mongoose = require("mongoose");

const url =
  "mongodb+srv://kanhaiyalalkesar:Kanhaiya@cluster0.8asc3dt.mongodb.net/?retryWrites=true&w=majority";

const connectToDb = async () => {
  try {
    const conn = await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(
      `connection with mongo db successfully , host is ${conn.connection.host}`
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectToDb;
