const mongoose = require("mongoose");
const url = process.env.MONGO_URL;

const dbConnect = async (callback) => {
  mongoose
    .connect(url)
    .then(() => {
      console.log("connected to the Database");
      callback();
    })
    .catch((err) => {
      console.log("Error connecting to the Database", err);
    });
};
// graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.disconnect();
  process.exit(0);
});

module.exports = dbConnect;
