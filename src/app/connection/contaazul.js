const axios = require("axios");
require('dotenv').config()

const encoded = (Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64'));

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

var CronJob = require('cron').CronJob;
var job = new CronJob(
    '0 */50 * * * *',
    function () {
        refreshCentro()
        refreshPtb()
    },
    null,
    true,
    'America/Los_Angeles'
);
// 1 = centro 
// 2=ptb

async function ll() {
    await prisma.conec.findMany().then(res => console.log(res))
}
// ll()
//👆👆 this dude makes this 👇👇 function runs every 50min



async function refreshCentro() {
    const headers = {
        "Authorization": `Basic ${encoded}`,
        "Content-Type": "application/json"
    }
    const db = await prisma.conec.findMany({ where: { id: 1 } })
    const body = {
        "grant_type": "refresh_token",
        "refresh_token": `${db[0]?.refresh_token}`
    }

    try {
        await axios.post("https://api.contaazul.com/oauth2/token",
            body, { headers }).then(async data => {
                console.log(data.data)
                await prisma.conec.update({
                    where: { id: 1 },
                    data: {
                        access_token: data?.data.access_token,
                        refresh_token: data?.data.refresh_token
                    }
                }
                )
            })

    } catch (error) {
        if (error) {
            console.log(error)
        }
    }
}

async function refreshPtb() {
    const headers = {
        "Authorization": `Basic ${encoded}`,
        "Content-Type": "application/json"
    }
    const db = await prisma.conec.findMany({ where: { id: 2 } })
    const body = {
        "grant_type": "refresh_token",
        "refresh_token": `${db[0]?.refresh_token}`
    }

    try {
        await axios.post("https://api.contaazul.com/oauth2/token",
            body, { headers }).then(async data => {
                console.log(data.data)
                await prisma.conec.update({
                    where: { id: 2 },
                    data: {
                        access_token: data?.data.access_token,
                        refresh_token: data?.data.refresh_token
                    }
                }
                )
            })

    } catch (error) {
        if (error) {
            console.log(error)
        }
    }
}
//this 👆👆 part saves on a database the access and refresh_token


