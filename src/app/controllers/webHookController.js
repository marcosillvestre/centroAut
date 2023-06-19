class WebHookController {

    async store(req, res) {

        const data = req.body
        console.log(data)
        return res.status(201).json({ message: "deu" })
    }
}

module.exports = new WebHookController()