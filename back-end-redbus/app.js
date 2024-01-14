const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(
  "sk_test_51D9ybxG1hGhZmBxsXKTXZ2VMP721dPDl4O1rd3FDyj7X0A9Ffhc3NFt4MhRob20DahnErmtteUwrvY4x9QnSNVx100IXgNpFlI"
); // add a stripe key, (this test key will expire on 18th march 2021)
const busRoutes = require("./routes/bus");
const bookingRoutes = require("./routes/booking");
const customerRoutes = require("./routes/customer");
const routeRoutes = require("./routes/route");

mongoose.pluralize(null);
app.use(express.json());
app.use(cors());


const connect = async() => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://redbus_db_user_1:umJkhSujb8dZoc2a@redbuscnstructweek.bujg6.mongodb.net/redbus?retryWrites=true&w=majority",
      {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    );
    // If the connection is successful, log a success message
    console.log(`MongoDB is Connected`);
  } catch (error) {
    // If an error occurs during connection, log the error message
    console.log(`Error: ${error.message}`);
  }
  
};

connect();

app.post("/v1/api/stripe-payments", async (req, res) => {
  const { product, token } = req.body;
  console.log("PRODUCT", product);
  console.log("PRICE", product.price);
  const idempontencyKey = uuidv4();
  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "inr",
          customer: customer.id,
          receipt_email: token.email,
          description: `Purchase of ${product.name}`,
        },
        { idempontencyKey }
      );
    })
    .then((result) => res.status(200).json(result))
    .catch((err) => console.log(err));
});

app.use(busRoutes);
app.use(bookingRoutes);
app.use(customerRoutes);
app.use(routeRoutes);
const bookingHireRoutes = require("./routes/bookinghire");
app.use(bookingHireRoutes);

const busServiceRoutes = require("./routes/busservice");
app.use(busServiceRoutes);


const port = process.env.PORT || 3020;
// let host = process.env.HOST;
// const start = async () => {
//   await connect();
//   app.listen(port, host);
// };
// start();

// Basic route for testing server
app.get("/", (req, res) => {
  res.send("hello world");
});
// Start the Express server and listen on port 4000
app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
