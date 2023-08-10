const axios = require("axios");
require('dotenv').config()

const encoded = (Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64'));

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

var CronJob = require('cron').CronJob;
var job = new CronJob(
    '0 */50 * * * *',

    function () {
        token()
    },
    null,
    true,
    'America/Los_Angeles'
);

//👆👆 this dude makes this 👇👇 function runs every 50min


async function token() {
    await prisma.conec.findMany().then(res => {
        refreshCentro(res.filter(data => data.id === 1))
        refreshPtb(res.filter(data => data.id === 2))
    })
}
async function refreshCentro(token) {
    const headers = {
        "Authorization": `Basic ${encoded}`,
        "Content-Type": "application/json"
    }
    const body = {
        "grant_type": "refresh_token",
        "refresh_token": `${token[0]?.refresh_token}`
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

async function refreshPtb(token) {
    const headers = {
        "Authorization": `Basic ${encoded}`,
        "Content-Type": "application/json"
    }
    const body = {
        "grant_type": "refresh_token",
        "refresh_token": `${token[0]?.refresh_token}`
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
