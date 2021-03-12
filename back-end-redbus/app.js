const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(
  "sk_test_51D9ybxG1hGhZmBxsLWTFdI3TnMsj8W63ZolWzACySfUDLTdkCQXkOFpcJiBi0wKo3QDcUGXS5NJ5QGGf3K3z1QVp006yCc7aim"
); // add a stripe key, (this test key will expire on 18th march 2021)

mongoose.pluralize(null);
app.use(express.json());
app.use(cors());
const busRoutes = require("./routes/bus");
const bookingRoutes = require("./routes/booking");
const customerRoutes = require("./routes/customer");
const routeRoutes = require("./routes/route");

app.post("/v1/api/stripe-payments", (req, res) => {
  const { product, token } = req.body;
  console.log("PRODUCT", product);
  console.log("PRICE", product.poice);

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
const busServiceRoutes = require("./routes/busservice");

const connect = () => {
  return mongoose.connect(
    "mongodb+srv://redbus_db_user_1:umJkhSujb8dZoc2a@redbuscnstructweek.bujg6.mongodb.net/redbus?retryWrites=true&w=majority",
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }
  );
};

const start = async () => {
  await connect();
  app.listen(8000, () => console.log("Listening at Port 8000"));
};
start();
