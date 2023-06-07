require('dotenv').config()
const yup = require('yup')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

class AccessController {
    async update(req, res) {
        const schema = yup.object().shape({
            access_token: yup.string().required(),
            refresh_token: yup.string().required()
        })

        try {
            await schema.validateSync(req.body, { abortEarly: false })     //this guy validates what comes from multiple places 
        } catch (err) {
            return res.status(400).json({ error: err.errors })
        }

        const {
            access_token,
            refresh_token
        } = req.body
        try {
            await prisma.conec.update({
                where: { id: 1 },
                data: {
                    access_token,
                    refresh_token
                }
            })

        } catch (error) {
            if (error) {
                return res.status(400).json({ message: "Tem algum problema" })
            }
        }
        return res.status(201).json({ message: "Token enviado com sucesso" })
    }

    async index(req, res) {
        const db = await prisma.conec.findMany()
        return res.status(201).json(db)
    }



}
module.exports = new AccessController()
