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
const headers = {
    "Authorization": `Basic ${encoded}`,
    "Content-Type": "application/json"
}

async function token() {
    await prisma.conec.findMany().then(res => {
        refreshCentro(res.filter(data => data.id === 1))
        refreshPtb(res.filter(data => data.id === 2))
    })
}

token()

// 1
// at = o4I29IfSQSMNypblboTNbl7o5fBHdbwM
// rt = lNUYIV6Th3AnI89Mn4hyPGDZRiLKeYRL

// 2
// at2 = 8HB6SNFfKxqnHRx7hKBjUNReiEfKuhvQ
// rt2 = Bv1rrHVuL7yfM7rE3xxyWLjhmroOdBmx


async function refreshCentro(token) {
    const body = {
        "grant_type": "refresh_token",
        "refresh_token": `${token[0]?.refresh_token}`
    }

    try {
        await axios.post("https://api.contaazul.com/oauth2/token",
            body, { headers }).then(async data => {
                await prisma.conec.update({
                    where: { id: 1 },
                    data: {
                        access_token: data?.data.access_token,
                        refresh_token: data?.data.refresh_token
                    }
                })
            })

    } catch (error) {
    }
}

async function refreshPtb(token) {
    const body = {
        "grant_type": "refresh_token",
        "refresh_token": `${token[0]?.refresh_token}`
    }

    try {
        await axios.post("https://api.contaazul.com/oauth2/token",
            body, { headers }).then(async data => {

                await prisma.conec.update({
                    where: { id: 2 },
                    data: {
                        access_token: data?.data.access_token,
                        refresh_token: data?.data.refresh_token
                    }
                })
            })

    } catch (error) {
    }
}
//this 👆👆 part saves on a database the access and refresh_token
