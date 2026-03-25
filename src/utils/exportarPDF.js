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

export function exportarRescisaoPDF(dados, resultado) {
    const doc = new jsPDF()
    const ano = new Date().getFullYear()

    // Header
    doc.setFillColor(16, 185, 129) // emerald-500
    doc.rect(0, 0, 210, 35, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('CalcTrabalhista', 14, 18)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Relatório de Rescisão Trabalhista — Tabelas ${ano}`, 14, 28)

    // Dados do cálculo
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Dados do Cálculo', 14, 48)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)

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

    if (dados.avisoPrevioTrabalhado) {
        dadosCalculo.push(['Aviso Prévio', 'Trabalhado'])
    }
    if (dados.feriasVencidas) {
        dadosCalculo.push(['Férias Vencidas', 'Sim'])
    }

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

    // Verbas Rescisórias
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
        columnStyles: {
            2: { halign: 'right', fontStyle: 'bold' },
        },
        didParseCell: function (data) {
            // Última linha (Total) em bold
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
            columnStyles: {
                2: { halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] },
            },
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

    // Total Líquido
    posY = doc.lastAutoTable.finalY + 12

    doc.setFillColor(16, 185, 129)
    doc.roundedRect(14, posY, 182, 20, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL LÍQUIDO DA RESCISÃO', 20, posY + 9)
    doc.setFontSize(16)
    doc.text(formatarMoedaPDF(resultado.totalLiquido), 190, posY + 13, { align: 'right' })

    // Footer
    const pageHeight = doc.internal.pageSize.height
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('Este documento tem caráter informativo e não substitui orientação profissional.', 14, pageHeight - 15)
    doc.text(`Gerado por CalcTrabalhista (calctrabalhista.vercel.app) em ${new Date().toLocaleDateString('pt-BR')}`, 14, pageHeight - 10)

    // Salvar
    doc.save(`rescisao-trabalhista-${ano}.pdf`)
}