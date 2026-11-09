import { a, defineData, type ClientSchema } from '@aws-amplify/backend'

const schema = a.schema({
  Post: a.model({
    title: a.string().required(),
    body: a.string().required(),
  }).authorization((allow) => [
    allow.group('Admins'),
    allow.group('Editors').to(['read', 'create', 'update']),
    allow.group('Readers').to(['read']),
  ]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: { defaultAuthorizationMode: 'userPool' },
})
