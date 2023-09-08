const axios = require('axios')
const moment = require('moment')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
require('dotenv').config()

const currentDate = new Date();

const PtbAccount = require('../services/ptb/PTBreceive_rules')
const CentroAccount = require('../services/centro/receive_rules')

const CentroFormaDePagamento = require('../services/centro/payment_terms')
const PTBformaDePagamento = require('../services/ptb/PTBpayment_terms')


class RegisterController {
    async store(req, res) {

        const { name } = req.body


        console.log(name)

        const headers = {
            "content-type": "application/json",
        }

        const { data: { deals } } = await axios.get(`https://crm.rdstation.com/api/v1/deals?token=${process.env.RD_TOKEN}&name=${name}`, { headers })


        const contrato = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Nº do contrato')).map(res => res.value)[0]
        const unidade = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Unidade')).map(res => res.value)[0]
        const rg = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('RG responsável')).map(res => res.value)[0]
        const cpf = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('CPF')).map(res => res.value)[0]
        const DatadeNascdoResp = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Data de nascimento do  responsável')).map(res => res.value)[0]
        const CelularResponsavel = deals[0].contacts[0]?.phones[0]?.phone
        const EnderecoResponsavel = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Rua')).map(res => res.value)[0]
        const NumeroEnderecoResponsavel = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Número')).map(res => res.value)[0]
        const complemento = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Complemento')).map(res => res.value)[0]
        const bairro = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Bairro')).map(res => res.value)[0]
        const cep = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('CEP')).map(res => res.value)[0]
        const profissao = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Profissão')).map(res => res.value)[0]
        const email = deals[0].contacts[0]?.emails[0]?.email
        const cargaHoraria = `${deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Carga horário do curso')).map(res => res.value)}`
        const numeroParcelas = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Número de parcelas')).map(res => res.value)[0]
        const descontoTotal = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Desconto total')).map(res => res.value)[0]
        const descontoPorParcela = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Valor do desconto de pontualidade por parcela')).map(res => res.value)[0]
        const valorParcela = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Valor total da parcela')).map(res => res.value)[0]
        const curso = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Curso')).map(res => res.value)[0]
        const valorCurso = deals[0].deal_products[0]?.total
        const ppFormaPg = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Forma de pagamento da parcela')).map(res => res.value)[0]
        const ppVencimento = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Data de vencimento da primeira parcela')).map(res => res.value)[0]
        const dataUltimaP = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Data de vencimento da última parcela')).map(res => res.value)[0]
        const materialDidatico = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Material didático')).map(res => res.value)[0]
        const mdValor = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Valor do material didático')).map(res => res.value)[0]
        const mdFormaPg = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Forma de pagamento do MD')).map(res => res.value)[0]
        const mdVencimento = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Data de pagamento MD')).map(res => res.value)[0]

        const tmValor = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Valor de taxa de matrícula')).map(res => res.value)[0]
        const tmFormaPg = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Forma de pagamento TM')).map(res => res.value)[0]
        const tmVencimento = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Data de pagamento TM')).map(res => res.value)[0]
        const nameResponsible = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes("Nome  do responsável")).map(res => res.value)[0]


        try {
            var header = []

            const token = await prisma.conec.findMany({ where: { id: unidade.includes("PTB") || unidade.includes("Golfinho Azul") ? 2 : 1 } })
            console.log(unidade)

            header.push({
                "Authorization": `Bearer ${token[0]?.access_token}`,
                "Content-Type": "application/json"
            })


            const customerBody = {
                "name": nameResponsible,
                "email": email,
                "business_phone": CelularResponsavel,
                "mobile_phone": CelularResponsavel,
                "person_type": cpf.lenght <= 11 ? "LEGAL" : "NATURAL",
                "document": cpf,
                "identity_document": rg, //
                "date_of_birth": new Date(DatadeNascdoResp.split("/").reverse().join("-")),
                "notes": contrato,
                "contacts": [
                    {
                        "name": name.split("-")[0],
                        "business_phone": CelularResponsavel,
                        "email": email,
                        "job_title": profissao
                    }
                ],
                "address": {
                    "street": EnderecoResponsavel,
                    "number": NumeroEnderecoResponsavel,
                    "complement": complemento,
                    "neighborhood": bairro
                }
            }

            senderCustomer(header[0])

            async function senderCustomer(header) {
                await axios.post('https://api.contaazul.com/v1/customers',
                    customerBody, { headers: header }).then(async res => {
                        senderSale(res.data)
                    })
                    .catch(async err => {
                        if (err.response.data.message === 'CPF/CPNJ já utilizado por outro cliente.') {
                            await axios.get(`https://api.contaazul.com/v1/customers?document=${cpf}`,
                                { headers: header }).then(async data => {
                                    senderSale(data.data[0])
                                })
                        } else {
                            console.log(err)
                        }


                    })
            }

            const parcelas = [];
            const month_value = (valorCurso / numeroParcelas).toFixed(2)


            for (let i = 0; i < numeroParcelas; i++) {
                const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 11);
                const parcela = {
                    "number": i + 1,
                    "value": parseFloat(month_value),
                    "due_date": dueDate.toISOString(),
                    "status": 'PENDING',
                };
                parcelas.push(parcela);
            }



            const centroMethod = CentroFormaDePagamento[ppFormaPg];
            const ptbMethod = PTBformaDePagamento[ppFormaPg]



            const financial = unidade.includes("PTB") || unidade.includes("Golfinho Azul") ?
                PtbAccount[ptbMethod] : CentroAccount[centroMethod]


            const salesNotesString = {
                "Valor da Parcela": month_value,
                "PP Forma PG": ppFormaPg,
                "Parcela dia de vencimento": ppVencimento.split("/")[0],
                "PP Vencimento": ppVencimento,
                "Data de vencimento da última": dataUltimaP,
                "N° de Parcelas": numeroParcelas,
                "Desconto total": descontoTotal,

                "MD": materialDidatico.map(res => res),
                "MD Valor": mdValor,
                "MD vencimento": mdVencimento,
                "MD forma pg": mdFormaPg,

                "TM Valor": tmValor,
                "TM forma de pg": tmFormaPg,
                "TM Venc": tmVencimento,

                "Carga Horária do Curso": cargaHoraria,
                "Unidade": unidade,
                "Curso": curso
            }
            const saleNotes = JSON.stringify(salesNotesString, null, 2)

            async function senderSale(customer) {
                await axios.get(`https://api.contaazul.com/v1/services`, { headers: header[0] })
                    .then(async res => {
                        const filtered = res.data?.filter(res => res.name === deals[0].deal_products[0].name)

                        const courseSale = {
                            "emission": customer?.created_at,
                            "status": "PENDING",
                            "customer_id": customer?.id,
                            "services": [
                                {
                                    "description": filtered[0]?.name,
                                    "quantity": 1,
                                    "service_id": filtered[0]?.id,
                                    "value": parseFloat(valorCurso)
                                }
                            ],
                            "discount": {
                                "measure_unit": "VALUE",
                                "rate": 0
                            },
                            "payment": {
                                "type": numeroParcelas <= 1 ? "CASH" : "TIMES",
                                "method": unidade.includes("PTB") ||
                                    unidade.includes("Golfinho Azul") ?
                                    ptbMethod : centroMethod,
                                "installments":
                                    parcelas
                                ,
                                "financial_account_id": financial
                            },
                            "notes": saleNotes,
                            "category_id": ""
                        }


                        ContaAzulSender(courseSale)

                        parseFloat(tmValor) > 1 && SenderTax(customer, token)
                        parseFloat(mdValor) > 1 && senderTeachingMaterial(customer)
                    })

            }



            const centroMethodMaterial = CentroFormaDePagamento[mdFormaPg];
            const ptbMethodMaterial = PTBformaDePagamento[mdFormaPg]

            const financialMaterial = unidade.includes("PTB") || unidade.includes("Golfinho Azul") ?
                PtbAccount[ptbMethodMaterial] : CentroAccount[centroMethodMaterial]

            const formattedDate = moment(mdVencimento, "DD/MM/YYYY").toDate();

            let products = []

            async function senderTeachingMaterial(customer) {

                materialDidatico.map(async data => {

                    await axios.get(`https://api.contaazul.com/v1/products?name=${data}`, { headers: header[0] })
                        .then(res => {
                            const pd = {
                                "description": res.data[0]?.name,
                                "quantity": 1,
                                "value": res.data[0]?.value,


                                "product_id": res.data[0]?.id,
                            }
                            return products.push(pd)

                        })
                    if (products.length === materialDidatico.length) {
                        const teachingmaterial = {
                            "emission": customer?.created_at,
                            "status": "PENDING",
                            "customer_id": customer?.id,
                            "products": products,
                            "payment": {
                                "type": "TIMES",
                                "method": unidade.includes("PTB") || unidade.includes("Golfinho Azul") ?
                                    ptbMethodMaterial : centroMethodMaterial,
                                "installments":
                                    [{
                                        "number": 1,
                                        "value": parseFloat(mdValor),
                                        "due_date": formattedDate,
                                        "status": "PENDING",
                                    }]
                                ,
                                "financial_account_id": financialMaterial
                            },
                            "notes": saleNotes,
                            "category_id": ""
                        }
                        ContaAzulSender(teachingmaterial)
                    }
                })
            }






            const centroMethodTax = CentroFormaDePagamento[tmFormaPg];
            const ptbMethodTax = PTBformaDePagamento[tmFormaPg]


            const taxFinancial = unidade.includes("PTB") || unidade.includes("Golfinho Azul") ?
                PtbAccount[ptbMethodTax] : CentroAccount[centroMethodTax]

            const formatedTaxDate = moment(tmVencimento, "DD/MM/YYYY").toDate()

            async function SenderTax(customer) {
                const taxCell = {
                    "emission": customer?.created_at,
                    "status": "PENDING",
                    "customer_id": customer?.id,
                    "services": [
                        {
                            "description": "Taxa de Matrícula",
                            "quantity": 1,
                            "service_id": unidade.includes("PTB") || unidade.includes("Golfinho Azul") ?
                                "09a1a3f8-f75e-4b25-a2ce-e815514028de" : "682c4202-e0c2-4bab-a847-c8dbe89b80d9",
                            "value": parseFloat(tmValor)
                        }
                    ],
                    "payment": {
                        "type": "TIMES",
                        "method": unidade.includes("PTB") || unidade.includes("Golfinho Azul") ?
                            ptbMethodTax : centroMethodTax,
                        "installments":
                            [{
                                "number": 1,
                                "value": parseFloat(tmValor),
                                "due_date": formatedTaxDate,
                                "status": "PENDING",
                            }]
                        ,
                        "financial_account_id": taxFinancial
                    },
                    "notes": saleNotes,
                }
                ContaAzulSender(taxCell)
            }



            async function ContaAzulSender(cell) {
                await axios.post('https://api.contaazul.com/v1/sales', cell, { headers: header[0] })
                    .then(data => {
                        if (data.status === 201 || data.status === 200) {
                            console.log("A venda foi lançada")
                            return res.status(201).json({ message: "A venda foi lançada" })
                        }
                    }).catch((err) => {
                        if (err) {
                            console.log(0)
                        }

                    })
            }


        } catch (error) {
            if (error) {
                console.log(error)
                return res.status(401).json({ message: "Something went wrong" })
            }
        }

    }
}

module.exports = new RegisterController()

