require('dotenv').config()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

class AccessController {

    async index(req, res) {
        const db = await prisma.conec.findMany()
        return res.status(201).json(db)
    }



}
module.exports = new AccessController()
