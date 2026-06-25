import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "moscheenShMedia",
  access: (allow) => ({
    "public/*": [allow.guest.to(["read"]), allow.authenticated.to(["read"])],
    "protected/{entity_id}/*": [allow.authenticated.to(["read", "write"])]
  })
});
