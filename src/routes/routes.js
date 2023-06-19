const { Router } = require('express')
const routes = Router()
require("dotenv").config()

const RegisterController = require('../app/controllers/registerController')

const AccessController = require('../app/controllers/accessController')

const WebHookController = require('../app/controllers/webHookController')

routes.post("/cadastros", RegisterController.store)
routes.get("/access", AccessController.index)

routes.get("/", (req, res) => {
    return res.json("Hello World")
})


routes.post("/webhook", WebHookController.store)

module.exports = routes
