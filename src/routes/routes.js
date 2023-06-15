const { Router } = require('express')
const routes = Router()
require("dotenv").config()

const RegisterController = require('../app/controllers/registerController')

const AccessController = require('../app/controllers/accessController')

routes.post("/cadastros", RegisterController.store)
routes.get("/access", AccessController.index)

routes.get("/", (req, res) => {
    return res.json("Hello World")
})

module.exports = routes
