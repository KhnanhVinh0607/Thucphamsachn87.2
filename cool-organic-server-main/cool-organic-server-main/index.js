const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const dotenv = require('dotenv');
const indexRouter = require('./src/api/v1/routes/index.route');

dotenv.config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// const whitelist = ['http://localhost:3000'];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };
app.use(cors());

const mongoUri = "mongodb+srv://anhtai:anhtai2002@cluster0.9wfrytr.mongodb.net/cool-organic";
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Connected to MongoDB at ${mongoUri}`);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

app.use('/api/v1/', indexRouter);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
