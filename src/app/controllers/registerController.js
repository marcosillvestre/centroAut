const axios = require('axios')
const moment = require('moment')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const currentDate = new Date();

const PtbAccount = require('../services/ptb/PTBreceive_rules')
const CentroAccount = require('../services/centro/receive_rules')

const CentroFormaDePagamento = require('../services/centro/payment_terms')
const PTBformaDePagamento = require('../services/ptb/PTBpayment_terms')

class RegisterController {
    async store(req, res) {


        const { data: { name } } = req.body
        const headers = {
            "content-type": "application/json",
        }

        const { data: { deals } } = await axios.get(`https://crm.rdstation.com/api/v1/deals?token=64c1219c7de4220029d55fc7&name=${name}`, { headers })



        const vendedor = deals[0].user.name
        const contrato = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Nº do contrato')).map(res => res.value)[0]
        const dataMatricula = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Data de emissão da venda')).map(res => res.value)[0]
        const unidade = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Unidade')).map(res => res.value)[0]
        const tipoModalidade = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Tipo/ modalidade')).map(res => res.value)[0]
        const rg = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('RG responsável')).map(res => res.value)[0]
        const cpf = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('CPF')).map(res => res.value)[0]
        const DatadeNascdoResp = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Data de nascimento do  responsável')).map(res => res.value)[0]
        const CelularResponsavel = deals[0].contacts[0]?.phones[0]?.phone
        const EnderecoResponsavel = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Rua')).map(res => res.value)[0]
        const NumeroEnderecoResponsavel = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Número')).map(res => res.value)[0]
        const complemento = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Complemento')).map(res => res.value)[0]
        const bairro = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Bairro')).map(res => res.value)[0]
        const cidade = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Cidade')).map(res => res.value)[0]
        const estado = deals[0].deal_custom_fields.filter(res => res.custom_field.label === 'Estado').map(res => res.value)[0]
        const cep = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('CEP')).map(res => res.value)[0]
        const estadoCivil = deals[0].deal_custom_fields.filter(res => res.custom_field.label === 'Estado civil responsável').map(res => res.value)[0]
        const profissao = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Profissão')).map(res => res.value)[0]
        const email = deals[0].contacts[0]?.emails[0]?.email
        const nomeAluno = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Nome do aluno')).map(res => res.value)[0]
        const nascimentoAluno = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Data de nascimento do aluno')).map(res => res.value)[0]
        const formato = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Formato de Aula')).map(res => res.value)[0]
        const classe = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Classe')).map(res => res.value)[0]
        const subclasse = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Subclasse')).map(res => res.value)[0]
        const cargaHoraria = `${deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Carga horário do curso')).map(res => res.value)}`
        const paDATA = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Data da primeira aula')).map(res => res.value)[0]
        const valorMensalidade = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Valor total da parcela')).map(res => res.value)[0]
        const numeroParcelas = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Número de parcelas')).map(res => res.value)[0]
        const diaVenvimento = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Data de vencimento da primeira parcela')).map(res => res.value)[0]
        const dataPrimeiraParcelaMensalidade = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Data de vencimento da primeira parcela')).map(res => res.value)[0]
        const dataUltimaParcelaMensalidade = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Data de vencimento da última parcela')).map(res => res.value)[0]
        const descontoTotal = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Desconto total')).map(res => res.value)[0]
        const descontoPorParcela = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Valor do desconto de pontualidade por parcela')).map(res => res.value)[0]
        const valorParcela = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Valor total da parcela')).map(res => res.value)[0]
        const testemunha1 = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Testemunha 01')).map(res => res.value)[0]
        const testemunha2 = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Testemunha 2')).map(res => res.value)[0]
        const curso = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Curso')).map(res => res.value)[0]
        const valorCurso = deals[0].deal_products[0]?.total
        const background = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Background')).map(res => res.value)[0]
        const diaAula = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Dia de aula')).map(res => res.value)[0]
        const professor = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Professor')).map(res => res.value)
        const horarioFim = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Horário de fim')).map(res => res.value)[0]
        const horarioInicio = deals[0].deal_custom_fields.filter(res => res.custom_field.label.includes('Horário de Inicio')).map(res => res.value)[0]



        const objeto = {
            contrato,
            background,
            paDATA,
            diaAula,
            professor,
            horarioInicio,
            horarioFim
        }

        const notes = JSON.stringify(objeto, null, 3)

        const customerBody = {
            "name": name,
            "email": email,
            "business_phone": CelularResponsavel,
            "mobile_phone": CelularResponsavel,
            "person_type": cpf.lenght <= 11 ? "LEGAL" : "NATURAL",
            "document": cpf,
            "identity_document": rg, //
            "date_of_birth": new Date(DatadeNascdoResp.split("/").reverse().join("-")),
            "notes": notes,
            "contacts": [
                {
                    "name": name,
                    "business_phone": CelularResponsavel,
                    "email": email,
                    "job_title": profissao
                }
            ],
            "address": {
                "zip_code": cep,
                "street": EnderecoResponsavel,
                "number": NumeroEnderecoResponsavel,
                "complement": complemento,
                "neighborhood": bairro
            }
        }


        async function db() {
            const log = await prisma.conec.findMany({ where: { id: unidade.includes("PTB") || unidade.includes("Golfinho Azul") ? 2 : 1 } })
            senderCustomer(log[0]?.access_token)
        }
        // db()

        async function senderCustomer(token) {
            const headers = {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }

            await axios.post('https://api.contaazul.com/v1/customers',
                customerBody, { headers }).then(async res => {
                    senderSale(res.data, token)
                })
                .catch(async err => {
                    if (err.response.data.message === 'CPF/CPNJ já utilizado por outro cliente.') {
                        await axios.get(`https://api.contaazul.com/v1/customers?document=${cpf}`,
                            { headers }).then(async data => {
                                senderSale(data.data[0], token)
                            })
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

        console.log(parcelas)


        //     const centroMethod = CentroFormaDePagamento[parcela_forma_de_pagamento.value];
        //     const ptbMethod = PTBformaDePagamento[parcela_forma_de_pagamento.value]


        //     const financial = unidade.value.includes("PTB") || unidade.value.includes("Golfinho Azul") ?
        //         PtbAccount[ptbMethod] : CentroAccount[centroMethod]

        //     const salesNotesString = {
        //         "Valor da Primeira(s) Parcela(s)": valor_da_primeira_parcela,
        //         "Valor da Parcela": valor_da_parcela_apos_pp,
        //         "PP Forma PG": parcela_forma_de_pagamento.value,
        //         "Parcela dia de vencimento": parcela_dia_de_vencimento.value,
        //         "PP Vencimento": data_de_vencimento_da_primeira,
        //         "Data de vencimento da última": data_de_vencimento_da_ultima_p,
        //         "N° de Parcelas": n_de_parcelas.value,
        //         "Desconto total": desconto_total_pontualidade,

        //         "MD": material_didatico.map(res => res.value),
        //         "MD Valor": md_valor_ex_300_00,
        //         "MD vencimento": md_data_de_pagamento,
        //         "MD forma pg": md_forma_de_pagamento.value,

        //         "TM Valor": tm_valor_ex_150_00,
        //         "TM forma de pg": tm_forma_de_pagamento.value,
        //         "TM Venc": tm_data_de_pagamento,

        //         "Carga Horária do Curso": carga_horaria_do_curso,
        //         "Unidade": unidade.value,
        //         "Descrição": data.description,
        //         "Curso": curso.value
        //     }
        //     const saleNotes = JSON.stringify(salesNotesString, null, 2)

        //     async function senderSale(customer, token) {
        //         const type = "services"

        //         const headers = {
        //             "Authorization": `Bearer ${token}`,
        //             "Content-Type": "application/json"
        //         }

        //         await axios.get(`https://api.contaazul.com/v1/${type}`, { headers })
        //             .then(async res => {
        //                 const filtered = res.data.filter(res => res.name === data.products[0].nome)
        //                 const courseSale = {
        //                     "emission": customer?.created_at,
        //                     "status": "PENDING",
        //                     "customer_id": customer?.id,
        //                     "services": [
        //                         {
        //                             "description": filtered[0].name,
        //                             "quantity": 1,
        //                             "service_id": filtered[0].id,
        //                             "value": data.value
        //                         }
        //                     ],
        //                     "discount": {
        //                         "measure_unit": "VALUE",
        //                         "rate": 0
        //                     },
        //                     "payment": {
        //                         "type": n_de_parcelas <= 1 ? "CASH" : "TIMES",
        //                         "method": unidade.value.includes("PTB") ||
        //                             unidade.value.includes("Golfinho Azul") ?
        //                             ptbMethod : centroMethod,
        //                         "installments":
        //                             parcelas
        //                         ,
        //                         "financial_account_id": financial
        //                     },
        //                     "notes": saleNotes,
        //                     "category_id": ""
        //                 }
        //                 ContaAzulSender(courseSale, headers)
        //                 senderTeachingMaterial(customer, token)
        //                 SenderTax(customer, token)
        //             })

        //     }

        //     const mdFromCentro = require('../services/centro/materialDidatico')
        //     const mdFromPtb = require('../services/ptb/materialDidaticoPtb')
        //     const products = []


        //     const centroMethodMaterial = CentroFormaDePagamento[md_forma_de_pagamento.value];
        //     const ptbMethodMaterial = PTBformaDePagamento[md_forma_de_pagamento.value]
        //     const priceMaterialCentro = require('../services/centro/teachingMaterialPrice')
        //     const priceMaterialPtb = require('../services/ptb/teachingMaterialPricePTB')


        //     material_didatico.map(data => {
        //         const pd = {
        //             "description": data.value,
        //             "quantity": 1,
        //             "value": unidade.value.includes("PTB") || unidade.value.includes("Golfinho Azul") ?
        //                 priceMaterialPtb[mdFromPtb[data.value]] : priceMaterialCentro[mdFromCentro[data.value]],

        //             "product_id": unidade.value.includes("PTB") || unidade.value.includes("Golfinho Azul") ?
        //                 mdFromPtb[data.value] : mdFromCentro[data.value],
        //         }
        //         products.push(pd)

        //     })


        //     const financialMaterial = unidade.value.includes("PTB") || unidade.value.includes("Golfinho Azul") ?
        //         PtbAccount[ptbMethodMaterial] : CentroAccount[centroMethodMaterial]

        //     const formattedDate = moment(md_data_de_pagamento, "DD/MM/YYYY").toDate();

        //     async function senderTeachingMaterial(customer, token) {

        //         const type = "products"

        //         const header = {
        //             "Authorization": `Bearer ${token}`,
        //             "Content-Type": "application/json"
        //         }

        //         const teachingmaterial = {
        //             "emission": customer?.created_at,
        //             "status": "PENDING",
        //             "customer_id": customer?.id,
        //             "products": products,
        //             "payment": {
        //                 "type": "TIMES",
        //                 "method": unidade.value.includes("PTB") || unidade.value.includes("Golfinho Azul") ?
        //                     ptbMethodMaterial : centroMethodMaterial,
        //                 "installments":
        //                     [{
        //                         "number": 1,
        //                         "value": md_valor_ex_300_00,
        //                         "due_date": formattedDate,
        //                         "status": "PENDING",
        //                     }]
        //                 ,
        //                 "financial_account_id": financialMaterial
        //             },
        //             "notes": saleNotes,
        //             "category_id": ""
        //         }
        //         ContaAzulSender(teachingmaterial, header)
        //     }


        //     const centroMethodTax = CentroFormaDePagamento[tm_forma_de_pagamento.value];
        //     const ptbMethodTax = PTBformaDePagamento[tm_forma_de_pagamento.value]


        //     const taxFinancial = unidade.value.includes("PTB") || unidade.value.includes("Golfinho Azul") ?
        //         PtbAccount[ptbMethodTax] : CentroAccount[centroMethodTax]

        //     const formatedTaxDate = moment(tm_data_de_pagamento, "DD/MM/YYYY").toDate()

        //     async function SenderTax(customer, token) {

        //         const type = "services"

        //         const header = {
        //             "Authorization": `Bearer ${token}`,
        //             "Content-Type": "application/json"
        //         }

        //         const taxCell = {
        //             "emission": customer?.created_at,
        //             "status": "PENDING",
        //             "customer_id": customer?.id,
        //             "services": [
        //                 {
        //                     "description": "Taxa de Matrícula",
        //                     "quantity": 1,
        //                     "service_id": unidade.value.includes("PTB") || unidade.value.includes("Golfinho Azul") ?
        //                         "09a1a3f8-f75e-4b25-a2ce-e815514028de" : "682c4202-e0c2-4bab-a847-c8dbe89b80d9",
        //                     "value": tm_valor_ex_150_00
        //                 }
        //             ],
        //             "payment": {
        //                 "type": "TIMES",
        //                 "method": unidade.value.includes("PTB") || unidade.value.includes("Golfinho Azul") ?
        //                     ptbMethodTax : centroMethodTax,
        //                 "installments":
        //                     [{
        //                         "number": 1,
        //                         "value": tm_valor_ex_150_00,
        //                         "due_date": formatedTaxDate,
        //                         "status": "PENDING",
        //                     }]
        //                 ,
        //                 "financial_account_id": taxFinancial
        //             },
        //             "notes": saleNotes,
        //         }
        //         ContaAzulSender(taxCell, header)
        //     }



        //     async function ContaAzulSender(cell, headers) {
        //         await axios.post('https://api.contaazul.com/v1/sales', cell, { headers })
        //             .then(data => {
        //                 data ? console.log("A venda foi lançada") : console.log("A venda nao foi lançada")
        //             }).catch(error => {
        //                 if (error) {
        //                     console.log(error)
        //                 }
        //             })
        //     }
        // }
        return res.status(201).json({ message: "Venda lançada com sucesso" })

    }
}

module.exports = new RegisterController()

