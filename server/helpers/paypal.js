const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox",
  client_id:
    "AcZBep0dZwWJRM_oCa3bCQWe-iAxOyCZvfVoKArzGomF3DfrxrzUV2PT4e8_71GB7PT8KBqLtG4ogn7Z",
  client_secret:
    "EJeqrwdeD5CMQY5WcE_FxVRNlEb9tWZRPjsfEa-DAKjBClGrE6IzgHF33hKyPYaC3uTZ0lnMFnUzhomH",
});

module.exports = paypal;
