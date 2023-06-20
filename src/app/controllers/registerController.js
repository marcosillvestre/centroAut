const axios = require('axios')
const moment = require('moment')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const currentDate = new Date();

const CentroItems = require('../services/centro/services')

const PtbAccount = require('../services/ptb/PTBreceive_rules')
const CentroAccount = require('../services/centro/receive_rules')

const CentroFormaDePagamento = require('../services/centro/payment_terms')
const PTBformaDePagamento = require('../services/ptb/PTBpayment_terms')
const PTBservices = require('../services/ptb/PTBservices')
class WebHookController {

    async store(req, res) {

        const { data: { id } } = req.body
        const headers = {
            "content-type": "application/json",
            "Authorization": "Token 07817e95-73e2-4649-91a1-ceb25da45914"
        }
        const { data: { data } } = await axios.get(`https://api.agendor.com.br/v3/deals/${id}?withCustomFields=true`, { headers })
        const { person } = data
        const { customFields } = data
        const { dealStage: { name: etapa } } = data

        if (etapa === 'Plano Financeiro') {
            const {
                md_valor_ex_300_00, md_forma_de_pagamento, md_data_de_pagamento, parcela_forma_de_pagamento,
                parcela_dia_de_vencimento, tm_data_de_pagamento, data_de_vencimento_da_primeira, data_de_vencimento_da_ultima_p,
                n_de_parcelas, desconto_total_pontualidade, tm_valor_ex_150_00, tm_forma_de_pagamento, valor_da_primeira_parcela, valor_da_parcela_apos_pp,
                background_do_aluno, dia_de_aula, professor, horario_de_inicio_ex_9_00, horario_do_fim_ex_10_00, curso,
                data_da_primeira_aula, n_do_contrato, carga_horaria_do_curso, unidade, material_didatico
            } = customFields

            const { name, email, cpf, role, contact, address } = person


            const background = background_do_aluno.value
            const dia_aula = dia_de_aula[0].value
            const prof = professor[0].value
            const objeto = {
                n_do_contrato,
                background,
                data_da_primeira_aula,
                dia_aula,
                prof,
                horario_de_inicio_ex_9_00,
                horario_do_fim_ex_10_00
            }

            const notes = JSON.stringify(objeto, null, 3)

            const customerBody = {
                "name": name,
                "email": email,
                "business_phone": contact.whatsapp,
                "mobile_phone": contact.mobile,
                "person_type": cpf.lenght <= 11 ? "LEGAL" : "NATURAL",
                "document": cpf,
                "identity_document": person.customFields.rg_responsavel, //
                "date_of_birth": new Date(person.birthday.split("/").reverse().join("-")),
                "notes": notes,
                "contacts": [
                    {
                        "name": name,
                        "business_phone": contact.mobile,
                        "email": email,
                        "job_title": role
                    }
                ],
                "address": {
                    "zip_code": address.postalCode,
                    "street": address.streetName,
                    "number": address.streetNumber,
                    "complement": address.additionalInfo,
                    "neighborhood": address.district
                }
            }
            async function db() {
                const log = await prisma.conec.findMany({ where: { id: unidade.value.includes("PTB") || unidade.value.includes("Golfinho Azul") ? 2 : 1 } })
                senderCustomer(log[0]?.access_token)
            }
            db()

            async function senderCustomer(token) {
                const headers = {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
                await axios.post('https://api.contaazul.com/v1/customers',
                    customerBody, { headers }).then(async res => {
                        senderSale(res.data)
                    })
                    .catch(async err => {
                        if (err.response.data.message === 'CPF/CPNJ já utilizado por outro cliente.') {
                            await axios.get(`https://api.contaazul.com/v1/customers?document=${cpf}`,
                                { headers }).then(async data => {
                                    senderSale(data.data[0])
                                })
                        }
                    })


            }

            const parcelas = [];
            const month_value = (data.value / customFields.n_de_parcelas.value).toFixed(2)

            for (let i = 0; i < customFields.n_de_parcelas.value; i++) {
                const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 11);
                const parcela = {
                    "number": i + 1,
                    "value": parseFloat(month_value),
                    "due_date": dueDate.toISOString(),
                    "status": 'PENDING',
                };
                parcelas.push(parcela);
            }


            const centroMethod = CentroFormaDePagamento[parcela_forma_de_pagamento];
            const ptbMethod = PTBformaDePagamento[parcela_forma_de_pagamento]

            const id_item = unidade.value.includes("PTB") || unidade.value.includes("Golfinho Azul") ? PTBservices[data.products[0].nome] : CentroItems[data.products[0].nome]
            const financial = unidade.value.includes("PTB") || unidade.value.includes("Golfinho Azul") ? PtbAccount[ptbMethod] : CentroAccount[centroMethod]

            const salesNotesString = {
                "Valor da Primeira(s) Parcela(s)": valor_da_primeira_parcela,
                "Valor da Parcela": valor_da_parcela_apos_pp,
                "PP Forma PG": parcela_forma_de_pagamento.value,
                "Parcela dia de vencimento": parcela_dia_de_vencimento.value,
                "PP Vencimento": data_de_vencimento_da_primeira,
                "Data de vencimento da última": data_de_vencimento_da_ultima_p,
                "N° de Parcelas": n_de_parcelas.value,
                "Desconto total": desconto_total_pontualidade,

                "MD": material_didatico.map(res => res.value),
                "MD Valor": md_valor_ex_300_00,
                "MD vencimento": md_data_de_pagamento,
                "MD forma pg": md_forma_de_pagamento.value,

                "TM Valor": tm_valor_ex_150_00,
                "TM forma de pg": tm_forma_de_pagamento.value,
                "TM Venc": tm_data_de_pagamento,
                "Carga Horária do Curso": carga_horaria_do_curso,
                "Unidade": unidade.value,
                "Descrição": data.description,
                "Curso": curso.value
            }
            const saleNotes = JSON.stringify(salesNotesString, null, 2)

            async function senderSale(customer) {
                const token = await prisma.conec.findMany({
                    where: {
                        id: unidade.value.includes("PTB") ||
                            unidade.value.includes("Golfinho Azul") ? 2 : 1
                    }
                })
                const headers = {
                    "Authorization": `Bearer ${token[0]?.access_token}`,
                    "Content-Type": "application/json"
                }

                const courseSale = {
                    "emission": customer?.created_at,
                    "status": "PENDING",
                    "customer_id": customer?.id,
                    "services": [
                        {
                            "description": data.products[0].nome,
                            "quantity": 1,
                            "service_id": id_item,
                            "value": data.value
                        }
                    ],
                    "discount": {
                        "measure_unit": "VALUE",
                        "rate": 0
                    },
                    "payment": {
                        "type": n_de_parcelas <= 1 ? "CASH" : "TIMES",
                        "method": unidade.value.includes("PTB") ||
                            unidade.value.includes("Golfinho Azul") ?
                            ptbMethod : centroMethod,
                        "installments":
                            parcelas
                        ,
                        "financial_account_id": financial
                    },
                    "notes": saleNotes,
                }
                ContaAzulSender(courseSale, headers)
                senderTeachingMaterial(customer, token[0]?.access_token)
            }




            const mdFromCentro = require('../services/centro/materialDidatico')
            const mdFromPtb = require('../services/ptb/materialDidaticoPtb')
            const products = []


            const centroMethodMaterial = CentroFormaDePagamento[md_forma_de_pagamento];
            const ptbMethodMaterial = PTBformaDePagamento[md_forma_de_pagamento]
            const priceMaterialCentro = require('../services/centro/teachingMaterialPrice')
            const priceMaterialPtb = require('../services/ptb/teachingMaterialPricePTB')


            material_didatico.map(data => {
                const pd = {
                    "description": data.value,
                    "quantity": 1,
                    "value": unidade.value.includes("PTB") || unidade.value.includes("Golfinho Azul") ?
                        priceMaterialPtb[mdFromPtb[data.value]] : priceMaterialCentro[mdFromCentro[data.value]],

                    "product_id": unidade.value.includes("PTB") || unidade.value.includes("Golfinho Azul") ?
                        mdFromPtb[data.value] : mdFromCentro[data.value],
                }
                products.push(pd)

            })



            const financialMaterial = unidade.value.includes("PTB") || unidade.value.includes("Golfinho Azul") ?
                PtbAccount[ptbMethodMaterial] : CentroAccount[centroMethodMaterial]


            const formattedDate = moment(md_data_de_pagamento, "DD/MM/YYYY").toDate();

            async function senderTeachingMaterial(customer, token) {
                const header = {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }

                const teachingmaterial = {
                    "emission": customer?.created_at,
                    "status": "PENDING",
                    "customer_id": customer?.id,
                    "products": products,
                    "payment": {
                        "type": "TIMES",
                        "method": unidade.value.includes("PTB") || unidade.value.includes("Golfinho Azul") ?
                            ptbMethodMaterial : centroMethodMaterial,
                        "installments":
                            [{
                                "number": 1,
                                "value": md_valor_ex_300_00,
                                "due_date": formattedDate,
                                "status": "PENDING",
                            }]
                        ,
                        "financial_account_id": financialMaterial
                    },
                    "notes": saleNotes,
                    "category_id": ""
                }
                ContaAzulSender(teachingmaterial, header)
            }


            async function ContaAzulSender(cell, headers) {
                await axios.post('https://api.contaazul.com/v1/sales', cell, { headers })
                    .then(data => {
                        data ? console.log("A venda foi lançada") : console.log("A venda nao foi lançada")
                    }).catch(error => {
                        if (error) {
                            console.log("deu ruim")
                        }
                    })
            }
        }
        return res.status(201).json({ message: "Venda lançada com sucesso" })

    }
}

module.exports = new WebHookController()


