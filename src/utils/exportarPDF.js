import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function formatarMoedaPDF(valor) {
    return 'R$ ' + Number(valor).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function formatarData(data) {
    if (!data) return ''
    const [ano, mes, dia] = data.split('-')
    return `${dia}/${mes}/${ano}`
}

function criarHeader(doc, titulo, subtitulo) {
    const ano = new Date().getFullYear()
    doc.setFillColor(16, 185, 129)
    doc.rect(0, 0, 210, 35, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('CalcTrabalhista', 14, 18)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${titulo} — Tabelas ${ano}`, 14, 28)
}

function criarFooter(doc) {
    const pageHeight = doc.internal.pageSize.height
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('Este documento tem caráter informativo e não substitui orientação profissional.', 14, pageHeight - 15)
    doc.text(`Gerado por CalcTrabalhista (calctrabalhista.vercel.app) em ${new Date().toLocaleDateString('pt-BR')}`, 14, pageHeight - 10)
}

function criarTotalDestacado(doc, posY, label, valor) {
    doc.setFillColor(16, 185, 129)
    doc.roundedRect(14, posY, 182, 20, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(label, 20, posY + 9)
    doc.setFontSize(16)
    doc.text(formatarMoedaPDF(valor), 190, posY + 13, { align: 'right' })
}

// =====================================================
// 1. RESCISÃO TRABALHISTA
// =====================================================
export function exportarRescisaoPDF(dados, resultado) {
    const doc = new jsPDF()

    criarHeader(doc, 'Relatório de Rescisão Trabalhista')

    // Dados do cálculo
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Dados do Cálculo', 14, 48)

    const tiposLabel = {
        sem_justa_causa: 'Demissão sem justa causa',
        pedido_demissao: 'Pedido de demissão',
        acordo_mutuo: 'Acordo mútuo (art. 484-A)',
        justa_causa: 'Justa causa',
    }

    const dadosCalculo = [
        ['Tipo de Rescisão', tiposLabel[dados.tipoRescisao] || dados.tipoRescisao],
        ['Salário Bruto', formatarMoedaPDF(dados.salarioBruto)],
        ['Data de Admissão', formatarData(dados.dataAdmissao)],
        ['Data de Demissão', formatarData(dados.dataDemissao)],
        ['Dias trabalhados (último mês)', String(dados.diasTrabalhados)],
        ['Dependentes (IR)', String(dados.dependentes)],
    ]

    if (dados.avisoPrevioTrabalhado) dadosCalculo.push(['Aviso Prévio', 'Trabalhado'])
    if (dados.feriasVencidas) dadosCalculo.push(['Férias Vencidas', 'Sim'])

    autoTable(doc, {
        startY: 53,
        body: dadosCalculo,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60, textColor: [60, 60, 60] },
            1: { textColor: [80, 80, 80] },
        },
    })

    // Verbas
    let posY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    doc.text('Verbas Rescisórias', 14, posY)

    const verbasData = resultado.verbas.map(v => [v.nome, v.detalhe, formatarMoedaPDF(v.valor)])
    verbasData.push(['Total Bruto', '', formatarMoedaPDF(resultado.totalBruto)])

    autoTable(doc, {
        startY: posY + 5,
        head: [['Verba', 'Detalhe', 'Valor']],
        body: verbasData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
        didParseCell: function (data) {
            if (data.row.index === verbasData.length - 1) {
                data.cell.styles.fontStyle = 'bold'
                data.cell.styles.fillColor = [240, 253, 244]
            }
        },
    })

    // Descontos
    if (resultado.descontos.length > 0) {
        posY = doc.lastAutoTable.finalY + 10
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(60, 60, 60)
        doc.text('Descontos', 14, posY)

        const descontosData = resultado.descontos.map(d => [d.nome, d.detalhe, '- ' + formatarMoedaPDF(d.valor)])
        descontosData.push(['Total Descontos', '', '- ' + formatarMoedaPDF(resultado.totalDescontos)])

        autoTable(doc, {
            startY: posY + 5,
            head: [['Desconto', 'Detalhe', 'Valor']],
            body: descontosData,
            theme: 'striped',
            headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold', fontSize: 9 },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: { 2: { halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] } },
            didParseCell: function (data) {
                if (data.row.index === descontosData.length - 1) {
                    data.cell.styles.fontStyle = 'bold'
                    data.cell.styles.fillColor = [254, 242, 242]
                }
            },
        })
    }

    // FGTS
    if (resultado.fgts) {
        posY = doc.lastAutoTable.finalY + 10
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(60, 60, 60)
        doc.text('FGTS', 14, posY)

        const fgtsData = [
            ['Saldo informado', formatarMoedaPDF(resultado.fgts.saldo)],
            ['Multa rescisória (' + resultado.fgts.multaPercentual + ')', formatarMoedaPDF(resultado.fgts.multa)],
        ]
        if (resultado.fgts.podeSacar) {
            fgtsData.push(['Total a receber (FGTS + Multa)', formatarMoedaPDF(resultado.fgts.totalFGTS)])
        } else {
            fgtsData.push(['Saque', 'Não disponível neste tipo de rescisão'])
        }

        autoTable(doc, {
            startY: posY + 5,
            body: fgtsData,
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 80, textColor: [60, 60, 60] },
                1: { halign: 'right', textColor: [16, 185, 129] },
            },
        })
    }

    // Total
    posY = doc.lastAutoTable.finalY + 12
    criarTotalDestacado(doc, posY, 'TOTAL LÍQUIDO DA RESCISÃO', resultado.totalLiquido)

    criarFooter(doc)
    doc.save(`rescisao-trabalhista-${new Date().getFullYear()}.pdf`)
}

// =====================================================
// 2. SALÁRIO LÍQUIDO
// =====================================================
export function exportarSalarioLiquidoPDF(dados, resultado) {
    const doc = new jsPDF()

    criarHeader(doc, 'Relatório de Salário Líquido')

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Dados do Cálculo', 14, 48)

    autoTable(doc, {
        startY: 53,
        body: [
            ['Salário Bruto', formatarMoedaPDF(resultado.bruto)],
            ['Dependentes (IR)', String(resultado.dependentes)],
            ['Outros descontos', formatarMoedaPDF(resultado.outrasDeducoes)],
        ],
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60, textColor: [60, 60, 60] },
            1: { textColor: [80, 80, 80] },
        },
    })

    let posY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    doc.text('Detalhamento', 14, posY)

    const detalhes = [
        ['Salário bruto', formatarMoedaPDF(resultado.bruto)],
        ['INSS (alíquota efetiva: ' + resultado.aliquotaEfetivaINSS + '%)', '- ' + formatarMoedaPDF(resultado.inss)],
        ['IRRF (alíquota efetiva: ' + resultado.aliquotaEfetivaIR + '%)', resultado.irrf === 0 ? 'Isento' : '- ' + formatarMoedaPDF(resultado.irrf)],
    ]
    if (resultado.outrasDeducoes > 0) {
        detalhes.push(['Outros descontos', '- ' + formatarMoedaPDF(resultado.outrasDeducoes)])
    }
    detalhes.push(['Total de descontos', '- ' + formatarMoedaPDF(resultado.totalDescontos)])
    detalhes.push(['Salário Líquido', formatarMoedaPDF(resultado.liquido)])

    autoTable(doc, {
        startY: posY + 5,
        body: detalhes,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold', textColor: [60, 60, 60] },
            1: { halign: 'right', fontStyle: 'bold' },
        },
        didParseCell: function (data) {
            if (data.row.index === detalhes.length - 1) {
                data.cell.styles.fontStyle = 'bold'
                data.cell.styles.fillColor = [240, 253, 244]
                data.cell.styles.textColor = [16, 185, 129]
            }
        },
    })

    posY = doc.lastAutoTable.finalY + 12
    criarTotalDestacado(doc, posY, 'SALÁRIO LÍQUIDO', resultado.liquido)

    if (resultado.beneficioIsencao) {
        posY += 28
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(16, 185, 129)
        doc.text('* Você está isento de Imposto de Renda (base de cálculo dentro da faixa de isenção).', 14, posY)
    }

    criarFooter(doc)
    doc.save(`salario-liquido-${new Date().getFullYear()}.pdf`)
}

// =====================================================
// 3. FÉRIAS
// =====================================================
export function exportarFeriasPDF(dados, resultado) {
    const doc = new jsPDF()

    criarHeader(doc, 'Relatório de Férias')

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Dados do Cálculo', 14, 48)

    const dadosCalculo = [
        ['Tipo de Férias', resultado.tipoFerias === 'integrais' ? 'Férias integrais (30 dias)' : `Proporcionais (${resultado.avos}/12 avos)`],
        ['Salário Bruto', formatarMoedaPDF(dados.salarioBruto)],
        ['Abono pecuniário', resultado.abono ? 'Sim (venda de 10 dias)' : 'Não'],
    ]

    autoTable(doc, {
        startY: 53,
        body: dadosCalculo,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60, textColor: [60, 60, 60] },
            1: { textColor: [80, 80, 80] },
        },
    })

    let posY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    doc.text('Verbas', 14, posY)

    const verbas = [
        ['Férias ' + (resultado.tipoFerias === 'integrais' ? '(30 dias)' : `(${resultado.avos}/12)`), formatarMoedaPDF(resultado.valorBase)],
        ['1/3 constitucional', formatarMoedaPDF(resultado.tercoConstitucional)],
    ]
    if (resultado.abono) {
        verbas.push(['Abono pecuniário (10 dias)', formatarMoedaPDF(resultado.valorAbono)])
        verbas.push(['1/3 sobre abono', formatarMoedaPDF(resultado.tercoAbono)])
    }
    verbas.push(['Total Bruto', formatarMoedaPDF(resultado.totalBruto)])

    autoTable(doc, {
        startY: posY + 5,
        head: [['Verba', 'Valor']],
        body: verbas,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
        didParseCell: function (data) {
            if (data.row.index === verbas.length - 1) {
                data.cell.styles.fontStyle = 'bold'
                data.cell.styles.fillColor = [240, 253, 244]
            }
        },
    })

    // Descontos
    posY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    doc.text('Descontos', 14, posY)

    const descontos = [
        ['INSS', '- ' + formatarMoedaPDF(resultado.inss)],
        ['IRRF', resultado.irrf === 0 ? 'Isento' : '- ' + formatarMoedaPDF(resultado.irrf)],
        ['Total Descontos', '- ' + formatarMoedaPDF(resultado.totalDescontos)],
    ]

    autoTable(doc, {
        startY: posY + 5,
        head: [['Desconto', 'Valor']],
        body: descontos,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
        didParseCell: function (data) {
            if (data.row.index === descontos.length - 1) {
                data.cell.styles.fontStyle = 'bold'
                data.cell.styles.fillColor = [254, 242, 242]
            }
        },
    })

    posY = doc.lastAutoTable.finalY + 12
    criarTotalDestacado(doc, posY, 'TOTAL LÍQUIDO DAS FÉRIAS', resultado.totalLiquido)

    criarFooter(doc)
    doc.save(`ferias-${new Date().getFullYear()}.pdf`)
}

// =====================================================
// 4. 13º SALÁRIO
// =====================================================
export function exportarDecimoTerceiroPDF(dados, resultado) {
    const doc = new jsPDF()

    criarHeader(doc, 'Relatório de 13º Salário')

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Dados do Cálculo', 14, 48)

    autoTable(doc, {
        startY: 53,
        body: [
            ['Salário Bruto', formatarMoedaPDF(dados.salarioBruto)],
            ['Meses trabalhados', resultado.meses + '/12'],
            ['Dependentes (IR)', String(dados.dependentes)],
        ],
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60, textColor: [60, 60, 60] },
            1: { textColor: [80, 80, 80] },
        },
    })

    let posY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    doc.text('Parcelas', 14, posY)

    const parcelas = [
        ['13º bruto total (' + resultado.meses + '/12)', formatarMoedaPDF(resultado.valorTotal)],
        ['1ª Parcela (até 30/nov) — sem descontos', formatarMoedaPDF(resultado.primeiraParcela)],
        ['INSS (sobre total)', '- ' + formatarMoedaPDF(resultado.inss)],
        ['IRRF (sobre total)', resultado.irrf === 0 ? 'Isento' : '- ' + formatarMoedaPDF(resultado.irrf)],
        ['2ª Parcela (até 20/dez) — com descontos', formatarMoedaPDF(resultado.segundaParcela)],
    ]

    autoTable(doc, {
        startY: posY + 5,
        head: [['Descrição', 'Valor']],
        body: parcelas,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    })

    posY = doc.lastAutoTable.finalY + 12
    criarTotalDestacado(doc, posY, 'TOTAL LÍQUIDO DO 13º SALÁRIO', resultado.totalLiquido)

    criarFooter(doc)
    doc.save(`decimo-terceiro-${new Date().getFullYear()}.pdf`)
}

// =====================================================
// 5. HORAS EXTRAS
// =====================================================
export function exportarHorasExtrasPDF(dados, resultado) {
    const doc = new jsPDF()

    criarHeader(doc, 'Relatório de Horas Extras')

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Dados do Cálculo', 14, 48)

    autoTable(doc, {
        startY: 53,
        body: [
            ['Salário Bruto', formatarMoedaPDF(dados.salarioBruto)],
            ['Carga horária mensal', resultado.cargaHoraria + 'h'],
            ['Horas extras no mês', String(resultado.qtdHoras) + 'h'],
            ['Adicional', resultado.percentual + '%'],
            ['DSR', resultado.calcularDSR ? 'Sim' : 'Não'],
        ],
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60, textColor: [60, 60, 60] },
            1: { textColor: [80, 80, 80] },
        },
    })

    let posY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    doc.text('Detalhamento', 14, posY)

    const detalhes = [
        ['Valor da hora normal', formatarMoedaPDF(resultado.valorHoraNormal)],
        ['Acréscimo por hora extra (' + resultado.percentual + '%)', '+ ' + formatarMoedaPDF(resultado.acrescimoHoraExtra)],
        ['Valor da hora extra', formatarMoedaPDF(resultado.valorHoraExtra)],
        ['Total horas extras (' + resultado.qtdHoras + 'h)', formatarMoedaPDF(resultado.totalHorasExtras)],
    ]
    if (resultado.calcularDSR) {
        detalhes.push(['DSR sobre horas extras', '+ ' + formatarMoedaPDF(resultado.valorDSR)])
    }
    detalhes.push(['Total Bruto', formatarMoedaPDF(resultado.totalBruto)])

    autoTable(doc, {
        startY: posY + 5,
        head: [['Descrição', 'Valor']],
        body: detalhes,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
        didParseCell: function (data) {
            if (data.row.index === detalhes.length - 1) {
                data.cell.styles.fontStyle = 'bold'
                data.cell.styles.fillColor = [240, 253, 244]
            }
        },
    })

    posY = doc.lastAutoTable.finalY + 12
    criarTotalDestacado(doc, posY, 'TOTAL BRUTO DE HORAS EXTRAS', resultado.totalBruto)

    posY += 28
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('* Este valor é bruto e será somado ao salário mensal. Os descontos de INSS e IR incidem sobre o total.', 14, posY)

    criarFooter(doc)
    doc.save(`horas-extras-${new Date().getFullYear()}.pdf`)
}

// =====================================================
// 6. SEGURO-DESEMPREGO
// =====================================================
export function exportarSeguroDesempregoPDF(dados, resultado) {
    const doc = new jsPDF()

    criarHeader(doc, 'Relatório de Seguro-Desemprego')

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Dados do Cálculo', 14, 48)

    const vezesLabel = { '0': '1ª solicitação (nunca recebeu)', '1': '2ª solicitação (recebeu 1 vez)', '2': '3ª+ solicitação (recebeu 2+ vezes)' }

    autoTable(doc, {
        startY: 53,
        body: [
            ['Último salário', formatarMoedaPDF(dados.salario1)],
            ['Penúltimo salário', formatarMoedaPDF(dados.salario2)],
            ['Antepenúltimo salário', formatarMoedaPDF(dados.salario3)],
            ['Meses trabalhados', String(dados.mesesTrabalhados)],
            ['Solicitação', vezesLabel[dados.vezesRecebeu] || dados.vezesRecebeu],
        ],
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60, textColor: [60, 60, 60] },
            1: { textColor: [80, 80, 80] },
        },
    })

    let posY = doc.lastAutoTable.finalY + 10

    if (!resultado.temDireito) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(220, 38, 38)
        doc.text('Resultado: Sem direito ao seguro-desemprego', 14, posY)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(80, 80, 80)
        doc.text(resultado.motivo, 14, posY + 8, { maxWidth: 180 })
    } else {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(60, 60, 60)
        doc.text('Resultado', 14, posY)

        const detalhes = [
            ['Média dos 3 últimos salários', formatarMoedaPDF(resultado.mediaSalarial)],
            ['Valor de cada parcela', formatarMoedaPDF(resultado.valorParcela)],
            ['Número de parcelas', String(resultado.parcelas)],
            ['Total estimado', formatarMoedaPDF(resultado.totalEstimado)],
        ]

        autoTable(doc, {
            startY: posY + 5,
            head: [['Descrição', 'Valor']],
            body: detalhes,
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
        })

        // Parcelas individuais
        posY = doc.lastAutoTable.finalY + 10
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(60, 60, 60)
        doc.text('Parcelas', 14, posY)

        const parcelasData = []
        for (let i = 1; i <= resultado.parcelas; i++) {
            parcelasData.push([i + 'ª parcela', formatarMoedaPDF(resultado.valorParcela)])
        }

        autoTable(doc, {
            startY: posY + 5,
            body: parcelasData,
            theme: 'striped',
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                0: { fontStyle: 'bold', textColor: [60, 60, 60] },
                1: { halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] },
            },
        })

        posY = doc.lastAutoTable.finalY + 12
        criarTotalDestacado(doc, posY, 'TOTAL ESTIMADO DO SEGURO-DESEMPREGO', resultado.totalEstimado)

        posY += 28
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text('* O seguro-desemprego não tem descontos de INSS ou Imposto de Renda.', 14, posY)
    }

    criarFooter(doc)
    doc.save(`seguro-desemprego-${new Date().getFullYear()}.pdf`)
}