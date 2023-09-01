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
                }
                )
            })

    } catch (error) {
        if (error) {
            console.log("error")
        }
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
                }
                )
            })

    } catch (error) {
        if (error) {
            console.log("error")
        }
    }
}
//this 👆👆 part saves on a database the access and refresh_token




[{ "id": "875d183f-9c9c-4dfe-ab80-f71fe76d7ade", "name": "Ativo Imobilizado" },
{ "id": "5898f1c6-bc24-4766-8644-9ec760a09a10", "name": "Categoria padrão" },
{ "id": "69743879-17b6-4883-9591-f12aa54b852e", "name": "Embalagem" },
{ "id": "2f65de25-0636-49fc-a698-9dbc77ba2128", "name": "Material de Uso e Consumo" },
{ "id": "a3a3e5a2-9939-46fc-88b8-caf80e6f6b1c", "name": "Material Didático - Adults and YA" },
{ "id": "44661b5f-9b07-4393-ad7e-7c48a9da1a84", "name": "Material Didático - Apostila Español" },
{ "id": "19aa231d-2fff-46a0-a425-f8d62b0286fc", "name": "Material Didático - Apostila SC - Adults" },
{ "id": "b4c3ec9e-d79c-4c7e-87db-f84ad9ea91fe", "name": "Material Didático - Apostila SC - Teens" },
{ "id": "c34793e2-f932-47f2-942d-de8ee5d3e237", "name": "Material Didático Dream Kids" },
{ "id": "43ff9c63-1c14-4e13-b900-67f2d1446f10", "name": "Material Didático - Espanhol" },
{ "id": "c181a798-dca8-4962-94aa-b3f39c483781", "name": "Material Didático Global Changer" },
{ "id": "42d7678f-3c38-4862-8c63-222d1ab4f503", "name": "Material Didático Interchange" },
{ "id": "92b38c22-338b-428e-a96a-1afc6fc79f0e", "name": "Material Didático - Kids" },
{ "id": "e49047cb-1143-45de-8793-907618856b2c", "name": "Material Didático Let's Go" },
{ "id": "60f096fe-fdc5-4ea9-b186-29d68ab16183", "name": "Material Didático - Little Ones" },
{ "id": "0ad2f966-7b9a-48cd-bceb-a5f27912b937", "name": "Material Didático - Teens" },
{ "id": "c987dd88-5e29-490b-9eb3-2b82e6f7f01e", "name": "Material Didático Touchstone" },
{ "id": "35bcc443-e694-45af-a243-1c52a0c96d27", "name": "Material Didático Vitamina" },
{ "id": "fce794b6-47b4-4109-a9cb-b40390b15b42", "name": "Matéria-Prima" },
{ "id": "dcc730b4-89a6-4ccf-9dd7-7272345238d7", "name": "Mercadoria para Revenda" },
{ "id": "d5e694e4-a85f-433b-ac52-1b3f45acc2f5", "name": "Outras" },
{ "id": "b4574cdf-45b1-4647-a937-791607be9aba", "name": "Outros insumos" },
{ "id": "ddf9b6bb-1bf7-430e-8eb0-2786d5362bd8", "name": "Produto Acabado" },
{ "id": "c0b7e114-89cf-4c3c-a2e2-83a2998fb59d", "name": "Produto em Processo" },
{ "id": "2e3d1ccb-3e67-4f0e-b58a-189767d4c42a", "name": "Produto Intermediário" },
{ "id": "3fc4ef55-bd53-40f5-9336-e6a6339852dc", "name": "Serviços" },
{ "id": "52911718-a1ed-4dfa-9d53-ab4acb026159", "name": "Subproduto" }]