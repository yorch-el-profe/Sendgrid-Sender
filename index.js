const express = require("express");
const { body, validationResult } = require("express-validator");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();

app.use(express.json());

const validations = [body("html").notEmpty(), body("to").notEmpty().isEmail()];

app.get("/", function (request, response) {
  response.sendFile(`${__dirname}/view/index.html`);
});

app.post("/send", validations, async function (request, response) {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  const { to, html } = request.body;

  const msg = {
    to,
    from: process.env.EMAIL_FROM,
    subject: process.env.EMAIL_SUBJECT,
    html,
  };

  try {
    await sgMail.send(msg);
    response.status(204).end();
  } catch (e) {
    response.status(500).json({ errors: e.response.body.errors });
  }
});

app.listen(process.env.PORT || 8080, function () {
  console.log("> Server listening requests");
});
