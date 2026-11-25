import { a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Mosque: a
    .model({
      name: a.string().required(),
      city: a.string(),
      address: a.string(),
      website: a.url()
    })
    .authorization((allow) => [allow.authenticated()])
});

export const data = defineData({
  schema
});
