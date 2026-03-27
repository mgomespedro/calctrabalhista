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

function criarHeader(doc, titulo, isPremium = false) {
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

    if (isPremium) {
        doc.setFillColor(245, 158, 11)
        doc.roundedRect(158, 8, 38, 12, 2, 2, 'F')
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text('★ PREMIUM', 177, 16, { align: 'center' })
    }
}

function criarFooter(doc, isPremium = false, email = '') {
    const pageHeight = doc.internal.pageSize.height
    const pageCount = doc.internal.getNumberOfPages()

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setTextColor(150, 150, 150)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text(
            'Este documento tem caráter informativo e não substitui orientação profissional.',
            14, pageHeight - 15
        )
        doc.text(
            `Gerado por CalcTrabalhista (calctrabalhista.vercel.app) em ${new Date().toLocaleDateString('pt-BR')}`,
            14, pageHeight - 10
        )
        if (isPremium && email) {
            doc.text(`Licenciado para: ${email}`, 196, pageHeight - 10, { align: 'right' })
        }
        doc.text(`Página ${i} de ${pageCount}`, 196, pageHeight - 15, { align: 'right' })
    }
}

function adicionarMarcaDagua(doc) {
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setTextColor(200, 200, 200)
        doc.setFontSize(40)
        doc.setFont('helvetica', 'bold')
        doc.saveGraphicsState()
        doc.setGState(new doc.GState({ opacity: 0.15 }))
        doc.text('VERSÃO GRATUITA', 105, 160, { align: 'center', angle: 45 })
        doc.restoreGraphicsState()
    }
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
// HELPERS PREMIUM — RESCISÃO
// =====================================================

/**
 * Calcula anos de serviço a partir das datas
 */
function calcularAnosServicoPDF(dataAdmissao, dataDemissao) {
    if (!dataAdmissao || !dataDemissao) return 0
    const inicio = new Date(dataAdmissao)
    const fim = new Date(dataDemissao)
    let anos = fim.getFullYear() - inicio.getFullYear()
    if (
        fim.getMonth() < inicio.getMonth() ||
        (fim.getMonth() === inicio.getMonth() && fim.getDate() < inicio.getDate())
    ) anos--
    return Math.max(0, anos)
}

/**
 * Simula o líquido de outro tipo de rescisão (para comparativo)
 * Usa cálculo simplificado: verbas indenizatórias + saldo salário - INSS/IR estimado
 */
function simularLiquidoTipo(tipo, salarioBruto, anosServico, saldoFGTS, dependentes) {
    // INSS simplificado (tabela 2026 progressiva)
    function inssSimples(base) {
        const b = Math.min(base, 8475.55)
        if (b <= 1621.00) return b * 0.075
        if (b <= 2902.84) return b * 0.09 - 24.32
        if (b <= 4354.27) return b * 0.12 - 111.40
        return b * 0.14 - 198.49
    }
    // IRRF simplificado
    function irrfSimples(base, dep) {
        const b = base - (dep * 189.59)
        if (b <= 2259.20) return 0
        if (b <= 2826.65) return Math.max(0, b * 0.075 - 169.44)
        if (b <= 3751.05) return Math.max(0, b * 0.15 - 381.44)
        if (b <= 4664.68) return Math.max(0, b * 0.225 - 662.77)
        return Math.max(0, b * 0.275 - 896.00)
    }
    // Redutor IR 2026
    function redutorIR(base, irBruto) {
        if (base <= 5000) return irBruto
        if (base <= 7350) return irBruto * (7350 - base) / (7350 - 5000)
        return 0
    }

    const diasAviso = Math.min(90, 30 + anosServico * 3)
    // Avos de 13 (simplificado: 6 avos médios)
    const avos13 = 6
    const avosFerias = 6

    let verbasRemuneratorias = salarioBruto // saldo salário (30 dias)
    let verbasIndenizatorias = 0
    let fgtsTotalReceber = 0
    let temSeguro = false

    if (tipo === 'sem_justa_causa') {
        verbasIndenizatorias += salarioBruto * diasAviso / 30 // aviso indenizado
        verbasIndenizatorias += (salarioBruto / 12) * avosFerias * (4 / 3) // férias prop + 1/3
        verbasRemuneratorias += (salarioBruto / 12) * avos13 // 13º prop
        if (saldoFGTS > 0) fgtsTotalReceber = saldoFGTS + saldoFGTS * 0.40
        temSeguro = true
    } else if (tipo === 'acordo_mutuo') {
        verbasIndenizatorias += (salarioBruto * diasAviso / 30) * 0.5 // aviso 50%
        verbasIndenizatorias += (salarioBruto / 12) * avosFerias * (4 / 3)
        verbasRemuneratorias += (salarioBruto / 12) * avos13
        if (saldoFGTS > 0) fgtsTotalReceber = saldoFGTS * 0.80 + saldoFGTS * 0.20
        temSeguro = false
    } else if (tipo === 'pedido_demissao') {
        verbasIndenizatorias += (salarioBruto / 12) * avosFerias * (4 / 3)
        verbasRemuneratorias += (salarioBruto / 12) * avos13
        fgtsTotalReceber = 0
        temSeguro = false
    }

    const inss = inssSimples(verbasRemuneratorias)
    const irBruto = irrfSimples(verbasRemuneratorias - inss, dependentes)
    const reducao = redutorIR(verbasRemuneratorias - inss, irBruto)
    const irFinal = Math.max(0, irBruto - reducao)
    const liquido = verbasRemuneratorias + verbasIndenizatorias - inss - irFinal

    return { liquido, fgtsTotalReceber, temSeguro, diasAviso }
}

/**
 * Desenha um gráfico de barras horizontais no PDF (sem biblioteca extra)
 */
function desenharGraficoBarras(doc, posY, dados) {
    // dados = [{label, valor, cor:[r,g,b]}, ...]
    const maxValor = Math.max(...dados.map(d => d.valor))
    const larguraMax = 120
    const alturaLinha = 14
    const xLabel = 14
    const xBarra = 72
    const xValor = 197

    dados.forEach((item, i) => {
        const y = posY + i * (alturaLinha + 4)
        const larguraBarra = maxValor > 0 ? (item.valor / maxValor) * larguraMax : 0

        // Label
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(60, 60, 60)
        doc.text(item.label, xLabel, y + alturaLinha / 2 + 2)

        // Fundo da barra (cinza claro)
        doc.setFillColor(230, 230, 230)
        doc.roundedRect(xBarra, y + 2, larguraMax, alturaLinha - 4, 2, 2, 'F')

        // Barra colorida
        if (larguraBarra > 0) {
            doc.setFillColor(...item.cor)
            doc.roundedRect(xBarra, y + 2, larguraBarra, alturaLinha - 4, 2, 2, 'F')
        }

        // Valor à direita
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...item.cor)
        doc.text(formatarMoedaPDF(item.valor), xValor, y + alturaLinha / 2 + 2, { align: 'right' })
    })

    return posY + dados.length * (alturaLinha + 4) + 4
}

/**
 * Desenha caixa de destaque com título e texto
 */
function desenharCaixa(doc, posY, titulo, linhas, corFundo, corTexto) {
    const padding = 5
    const alturaLinha = 6
    const altura = padding * 2 + alturaLinha + linhas.length * alturaLinha + 2

    doc.setFillColor(...corFundo)
    doc.roundedRect(14, posY, 182, altura, 3, 3, 'F')

    doc.setTextColor(...corTexto)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(titulo, 14 + padding, posY + padding + alturaLinha)

    doc.setFont('helvetica', 'normal')
    linhas.forEach((linha, i) => {
        doc.text(linha, 14 + padding, posY + padding + alturaLinha * 2 + i * alturaLinha + 1)
    })

    return posY + altura + 4
}

// =====================================================
// 1. RESCISÃO TRABALHISTA
// =====================================================
export function exportarRescisaoPDF(dados, resultado, isPremium = false, email = '') {
    const doc = new jsPDF()
    criarHeader(doc, 'Relatório de Rescisão Trabalhista', isPremium)

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

    posY = doc.lastAutoTable.finalY + 12
    criarTotalDestacado(doc, posY, 'TOTAL LÍQUIDO DA RESCISÃO', resultado.totalLiquido)

    // =========================================================
    // CONTEÚDO EXCLUSIVO PREMIUM — PÁGINA 2
    // =========================================================
    if (isPremium) {
        doc.addPage()
        criarHeader(doc, 'Análise Premium — Rescisão', true)

        posY = 45

        // ── TÍTULO DA PÁGINA ──
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(16, 185, 129)
        doc.text('Análise Financeira Detalhada', 14, posY)
        posY += 10

        // ── BLOCO 1: GRÁFICO DE BARRAS ──
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(60, 60, 60)
        doc.text('Composição da Rescisão', 14, posY)
        posY += 6

        const dadosGrafico = [
            { label: 'Total Bruto', valor: resultado.totalBruto, cor: [59, 130, 246] },
            { label: 'Total Descontos', valor: resultado.totalDescontos, cor: [239, 68, 68] },
            { label: 'Total Líquido', valor: resultado.totalLiquido, cor: [16, 185, 129] },
        ]
        // Adicionar FGTS se houver
        if (resultado.fgts && resultado.fgts.podeSacar && resultado.fgts.totalFGTS > 0) {
            dadosGrafico.push({ label: 'FGTS + Multa', valor: resultado.fgts.totalFGTS, cor: [245, 158, 11] })
        }

        posY = desenharGraficoBarras(doc, posY, dadosGrafico)
        posY += 6

        // ── BLOCO 2: ANÁLISE "QUANTO VALE" ──
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(60, 60, 60)
        doc.text('Análise: Quanto Representa Esta Rescisão?', 14, posY)
        posY += 6

        const salario = Number(dados.salarioBruto) || 1
        const mesesEquivalentes = resultado.totalLiquido / salario
        const mesesInteiros = Math.floor(mesesEquivalentes)
        const diasRestantes = Math.round((mesesEquivalentes - mesesInteiros) * 30)

        // Total receber incluindo FGTS
        let totalGeralComFGTS = resultado.totalLiquido
        if (resultado.fgts && resultado.fgts.podeSacar) totalGeralComFGTS += resultado.fgts.totalFGTS

        const mesesComFGTS = totalGeralComFGTS / salario
        const mInteiros = Math.floor(mesesComFGTS)
        const dRestantes = Math.round((mesesComFGTS - mInteiros) * 30)

        const linhasAnalise = [
            `► Rescisão liquida: equivale a ${mesesInteiros} ${mesesInteiros === 1 ? 'mês' : 'meses'}${diasRestantes > 0 ? ' e ' + diasRestantes + ' dias' : ''} de salário`,
        ]
        if (resultado.fgts && resultado.fgts.podeSacar && resultado.fgts.totalFGTS > 0) {
            linhasAnalise.push(`► Com FGTS + Multa (${formatarMoedaPDF(resultado.fgts.totalFGTS)}): total de ${formatarMoedaPDF(totalGeralComFGTS)}`)
            linhasAnalise.push(`   Equivale a ${mInteiros} ${mInteiros === 1 ? 'mês' : 'meses'}${dRestantes > 0 ? ' e ' + dRestantes + ' dias' : ''} de salário`)
        }
        linhasAnalise.push('► Prazo legal para pagamento: até 10 dias corridos após o último dia trabalhado')
        linhasAnalise.push('► Guarde o Termo de Rescisão (TRCT) — é o seu comprovante legal')

        posY = desenharCaixa(doc, posY, 'Equivalência e Prazos', linhasAnalise, [240, 253, 244], [21, 128, 61])
        posY += 4

        // ── BLOCO 3: COMPARATIVO DOS 3 TIPOS ──
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(60, 60, 60)
        doc.text('Comparativo: E se fosse outro tipo de rescisão?', 14, posY)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(120, 120, 120)
        doc.text('(Simulação com base no seu salário e tempo de serviço — avos médios)', 14, posY + 5)
        posY += 10

        const anosServico = calcularAnosServicoPDF(dados.dataAdmissao, dados.dataDemissao)
        const saldoFGTS = resultado.fgts ? resultado.fgts.saldo : 0
        const dependentes = Number(dados.dependentes) || 0

        const simSJC = simularLiquidoTipo('sem_justa_causa', salario, anosServico, saldoFGTS, dependentes)
        const simAM = simularLiquidoTipo('acordo_mutuo', salario, anosServico, saldoFGTS, dependentes)
        const simPD = simularLiquidoTipo('pedido_demissao', salario, anosServico, saldoFGTS, dependentes)

        const tipoActual = dados.tipoRescisao

        function marcaActual(tipo) {
            return tipo === tipoActual ? ' ◄ SEU CASO' : ''
        }

        const comparativoHead = [['', 'Demissão s/ Justa Causa', 'Acordo Mútuo', 'Pedido de Demissão']]
        const comparativoBody = [
            [
                'Rescisão Líquida',
                formatarMoedaPDF(tipoActual === 'sem_justa_causa' ? resultado.totalLiquido : simSJC.liquido) + marcaActual('sem_justa_causa'),
                formatarMoedaPDF(tipoActual === 'acordo_mutuo' ? resultado.totalLiquido : simAM.liquido) + marcaActual('acordo_mutuo'),
                formatarMoedaPDF(tipoActual === 'pedido_demissao' ? resultado.totalLiquido : simPD.liquido) + marcaActual('pedido_demissao'),
            ],
            [
                'FGTS + Multa',
                saldoFGTS > 0 ? formatarMoedaPDF(simSJC.fgtsTotalReceber) : 'Não informado',
                saldoFGTS > 0 ? formatarMoedaPDF(simAM.fgtsTotalReceber) : 'Não informado',
                'Não disponível',
            ],
            [
                'Aviso Prévio',
                `${simSJC.diasAviso} dias indenizados`,
                `${simAM.diasAviso} dias (50%)`,
                'Deve cumprir ou descontado',
            ],
            [
                'Seguro-Desemprego',
                '✔ Tem direito',
                '✘ Não tem direito',
                '✘ Não tem direito',
            ],
            [
                'Multa FGTS',
                '40% do saldo',
                '20% do saldo',
                'Nenhuma',
            ],
        ]

        autoTable(doc, {
            startY: posY,
            head: comparativoHead,
            body: comparativoBody,
            theme: 'grid',
            headStyles: { fillColor: [30, 30, 60], textColor: 255, fontStyle: 'bold', fontSize: 7.5, halign: 'center' },
            styles: { fontSize: 7.5, cellPadding: 3 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 38, textColor: [60, 60, 60] },
                1: { halign: 'center' },
                2: { halign: 'center' },
                3: { halign: 'center' },
            },
            didParseCell: function (data) {
                // Destacar coluna do tipo actual
                const colIdx = { sem_justa_causa: 1, acordo_mutuo: 2, pedido_demissao: 3 }[tipoActual]
                if (colIdx && data.column.index === colIdx) {
                    data.cell.styles.fillColor = [240, 253, 244]
                    data.cell.styles.fontStyle = 'bold'
                }
            },
        })

        posY = doc.lastAutoTable.finalY + 4

        // Nota sobre simulação
        doc.setFontSize(7)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(150, 150, 150)
        doc.text('* Simulação baseada em 6 avos médios de férias e 13º. Valores reais podem variar conforme o período aquisitivo exacto.', 14, posY)
        posY += 8

        // =========================================================
        // PÁGINA 3 — PRÓXIMOS PASSOS
        // =========================================================
        doc.addPage()
        criarHeader(doc, 'Análise Premium — Próximos Passos', true)

        posY = 45

        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(16, 185, 129)
        doc.text('Próximos Passos — O Que Fazer Agora?', 14, posY)
        posY += 8

        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(120, 120, 120)
        doc.text('Guia personalizado com base no seu tipo de rescisão: ' + (tiposLabel[dados.tipoRescisao] || dados.tipoRescisao), 14, posY)
        posY += 10

        // Definir passos de acordo com o tipo de rescisão
        const passos = []

        if (dados.tipoRescisao === 'sem_justa_causa') {
            passos.push({
                numero: '01',
                titulo: 'Receba o Termo de Rescisão (TRCT)',
                cor: [16, 185, 129],
                linhas: [
                    'O TRCT (Termo de Rescisão do Contrato de Trabalho) deve ser assinado em até 10 dias corridos.',
                    'Leia com atenção antes de assinar. Em caso de dúvida, consulte um advogado trabalhista.',
                    'Exija que todas as verbas calculadas constem no documento.',
                ],
            })
            passos.push({
                numero: '02',
                titulo: 'Saque o FGTS e a Multa de 40%',
                cor: [245, 158, 11],
                linhas: [
                    saldoFGTS > 0
                        ? `Você tem direito a sacar o saldo (${formatarMoedaPDF(saldoFGTS)}) + multa de 40% (${formatarMoedaPDF(saldoFGTS * 0.40)}).`
                        : 'Você tem direito ao saque do saldo do FGTS mais a multa de 40%.',
                    'Acesse o app FGTS (Caixa Econômica Federal) ou vá a uma agência da Caixa.',
                    'Documentos necessários: RG, CPF, Carteira de Trabalho e o TRCT assinado.',
                    'O saldo fica disponível geralmente em até 5 dias úteis após a homologação.',
                ],
            })
            passos.push({
                numero: '03',
                titulo: 'Solicite o Seguro-Desemprego',
                cor: [59, 130, 246],
                linhas: [
                    'Você tem direito ao seguro-desemprego por ter sido demitido sem justa causa.',
                    'Prazo: solicite entre o 7º e o 120º dia após a demissão.',
                    'Acesse: empregabrasil.mte.gov.br ou compareça ao SINE/agência do MTE.',
                    'Documentos: TRCT, Carteira de Trabalho, RG, CPF e comprovante de residência.',
                    'O número de parcelas varia de 3 a 5 conforme o tempo trabalhado.',
                ],
            })
            passos.push({
                numero: '04',
                titulo: 'Atualize a Carteira de Trabalho',
                cor: [139, 92, 246],
                linhas: [
                    'A empresa deve anotar a data de saída na Carteira de Trabalho (física ou digital).',
                    'Verifique pelo app Carteira de Trabalho Digital (Gov.br) se a baixa foi registrada.',
                    'O registro incorreto pode prejudicar futuros benefícios previdenciários.',
                ],
            })
            passos.push({
                numero: '05',
                titulo: 'Plano Financeiro para o Período de Transição',
                cor: [236, 72, 153],
                linhas: [
                    'Mapeie seus gastos fixos mensais e compare com as parcelas do seguro-desemprego.',
                    'Priorize: moradia, alimentação e saúde. Postergue compras não essenciais.',
                    'Considere usar parte da rescisão como reserva de emergência (ideal: 3 a 6 meses de custo).',
                    'Explore o MEI como opção se tiver planos de trabalho autônomo.',
                ],
            })
        } else if (dados.tipoRescisao === 'acordo_mutuo') {
            passos.push({
                numero: '01',
                titulo: 'Assine o Acordo com Atenção',
                cor: [16, 185, 129],
                linhas: [
                    'O acordo mútuo (art. 484-A da CLT) deve ser formalizado por escrito.',
                    'Ambas as partes devem assinar: você e a empresa. Guarde uma cópia.',
                    'Confirme que todas as verbas (50% do aviso, férias, 13º) estão no TRCT.',
                ],
            })
            passos.push({
                numero: '02',
                titulo: 'Saque Parcial do FGTS (80% do saldo)',
                cor: [245, 158, 11],
                linhas: [
                    saldoFGTS > 0
                        ? `No acordo mútuo você pode sacar 80% do saldo: ${formatarMoedaPDF(saldoFGTS * 0.80)}.`
                        : 'No acordo mútuo você pode sacar 80% do saldo do FGTS.',
                    'A multa é de 20% (não os 40% da demissão sem justa causa).',
                    'Acesse o app FGTS da Caixa com o TRCT assinado para realizar o saque.',
                ],
            })
            passos.push({
                numero: '03',
                titulo: 'Atenção: Sem Direito ao Seguro-Desemprego',
                cor: [239, 68, 68],
                linhas: [
                    'No acordo mútuo NÃO há direito ao seguro-desemprego.',
                    'Planeje suas finanças contando apenas com a rescisão e o FGTS.',
                    'Se tiver outra fonte de renda ou já tiver emprego garantido, o acordo pode compensar.',
                ],
            })
            passos.push({
                numero: '04',
                titulo: 'Atualize a Carteira de Trabalho',
                cor: [139, 92, 246],
                linhas: [
                    'A empresa deve registrar a saída na Carteira de Trabalho (física ou digital).',
                    'Verifique pelo app Carteira de Trabalho Digital (Gov.br).',
                ],
            })
            passos.push({
                numero: '05',
                titulo: 'Plano Financeiro para o Período de Transição',
                cor: [236, 72, 153],
                linhas: [
                    'Sem seguro-desemprego, o planejamento financeiro é ainda mais importante.',
                    'Calcule quantos meses a rescisão + FGTS cobrem os seus gastos fixos.',
                    'Priorize: moradia, alimentação e saúde. Postergue compras não essenciais.',
                ],
            })
        } else if (dados.tipoRescisao === 'pedido_demissao') {
            passos.push({
                numero: '01',
                titulo: 'Cumpra ou Negocie o Aviso Prévio',
                cor: [245, 158, 11],
                linhas: [
                    'Ao pedir demissão, você deve cumprir o aviso prévio ou a empresa pode descontá-lo.',
                    'Se a empresa dispensar o aviso, exija por escrito (e-mail ou carta assinada).',
                    'O desconto do aviso pode ser significativo — calcule antes de decidir.',
                ],
            })
            passos.push({
                numero: '02',
                titulo: 'Receba o TRCT e Confira',
                cor: [16, 185, 129],
                linhas: [
                    'Confira: saldo de salário, férias proporcionais + 1/3 e 13º proporcional.',
                    'No pedido de demissão NÃO há multa de FGTS e NÃO há saque do fundo.',
                    'O saldo do FGTS fica bloqueado — só disponível para situações específicas.',
                ],
            })
            passos.push({
                numero: '03',
                titulo: 'Atenção: Sem Seguro-Desemprego',
                cor: [239, 68, 68],
                linhas: [
                    'Quem pede demissão NÃO tem direito ao seguro-desemprego.',
                    'Certifique-se de ter outro emprego ou reserva financeira antes de sair.',
                ],
            })
            passos.push({
                numero: '04',
                titulo: 'Atualize a Carteira de Trabalho',
                cor: [139, 92, 246],
                linhas: [
                    'A empresa deve registrar a saída. Verifique no app Carteira de Trabalho Digital.',
                    'A baixa correta é importante para o histórico previdenciário.',
                ],
            })
        } else if (dados.tipoRescisao === 'justa_causa') {
            passos.push({
                numero: '01',
                titulo: 'Conteste se a Justa Causa For Indevida',
                cor: [239, 68, 68],
                linhas: [
                    'A justa causa é a rescisão mais prejudicial ao trabalhador — perde quase todos os direitos.',
                    'Se você acredita que a causa é injusta, consulte um advogado trabalhista imediatamente.',
                    'Você tem até 2 anos após a rescisão para entrar com reclamação na Justiça do Trabalho.',
                ],
            })
            passos.push({
                numero: '02',
                titulo: 'O Que Você Ainda Recebe',
                cor: [16, 185, 129],
                linhas: [
                    'Na justa causa você recebe apenas: saldo de salário dos dias trabalhados.',
                    'Não há: aviso prévio, férias proporcionais, 13º proporcional, FGTS, seguro-desemprego.',
                    'As férias vencidas (se houver) devem ser pagas — isso é um direito irrenunciável.',
                ],
            })
            passos.push({
                numero: '03',
                titulo: 'Atualize a Carteira de Trabalho',
                cor: [139, 92, 246],
                linhas: [
                    'A empresa deve anotar a saída. O motivo "justa causa" fica registrado.',
                    'Verifique no app Carteira de Trabalho Digital (Gov.br).',
                ],
            })
            passos.push({
                numero: '04',
                titulo: 'Plano de Emergência',
                cor: [236, 72, 153],
                linhas: [
                    'Sem seguro-desemprego e sem FGTS, organize sua reserva financeira urgentemente.',
                    'Priorize gastos essenciais. Verifique se tem direito a benefícios sociais (Bolsa Família, etc.).',
                    'Um advogado trabalhista pode avaliar se é viável reverter a justa causa judicialmente.',
                ],
            })
        }

        // Desenhar os passos
        passos.forEach((passo) => {
            // Verificar se há espaço na página
            const alturaEstimada = 12 + passo.linhas.length * 6 + 12
            if (posY + alturaEstimada > 270) {
                doc.addPage()
                criarHeader(doc, 'Análise Premium — Próximos Passos', true)
                posY = 45
            }

            // Número do passo
            doc.setFillColor(...passo.cor)
            doc.circle(21, posY + 5, 6, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(8)
            doc.setFont('helvetica', 'bold')
            doc.text(passo.numero, 21, posY + 7, { align: 'center' })

            // Título do passo
            doc.setTextColor(...passo.cor)
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text(passo.titulo, 30, posY + 7)

            posY += 13

            // Linhas de detalhe
            doc.setTextColor(60, 60, 60)
            doc.setFontSize(8.5)
            doc.setFont('helvetica', 'normal')
            passo.linhas.forEach((linha) => {
                const linhasQuebradas = doc.splitTextToSize(linha, 168)
                linhasQuebradas.forEach((l) => {
                    doc.text(l, 30, posY)
                    posY += 5.5
                })
            })

            // Linha separadora
            doc.setDrawColor(220, 220, 220)
            doc.line(14, posY + 2, 196, posY + 2)
            posY += 8
        })

        // ── NOTA FINAL ──
        if (posY + 20 > 270) {
            doc.addPage()
            criarHeader(doc, 'Análise Premium — Próximos Passos', true)
            posY = 45
        }

        posY += 4
        posY = desenharCaixa(doc, posY,
            'Lembrete Importante',
            [
                'Este relatório é um guia informativo. Para situações específicas ou contestações,',
                'consulte sempre um advogado trabalhista ou o sindicato da sua categoria.',
                'O CalcTrabalhista usa as tabelas oficiais de ' + new Date().getFullYear() + ' — verifique atualizações em calctrabalhista.vercel.app',
            ],
            [254, 243, 199],
            [146, 64, 14]
        )
    }

    if (!isPremium) adicionarMarcaDagua(doc)
    criarFooter(doc, isPremium, email)
    doc.save(`rescisao-trabalhista-${new Date().getFullYear()}.pdf`)
}

// =====================================================
// 2. SALÁRIO LÍQUIDO
// =====================================================
export function exportarSalarioLiquidoPDF(dados, resultado, isPremium = false, email = '') {
    const doc = new jsPDF()
    criarHeader(doc, 'Relatório de Salário Líquido', isPremium)

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

    if (!isPremium) adicionarMarcaDagua(doc)
    criarFooter(doc, isPremium, email)
    doc.save(`salario-liquido-${new Date().getFullYear()}.pdf`)
}

// =====================================================
// 3. FÉRIAS
// =====================================================
export function exportarFeriasPDF(dados, resultado, isPremium = false, email = '') {
    const doc = new jsPDF()
    criarHeader(doc, 'Relatório de Férias', isPremium)

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
    doc.text('Detalhamento', 14, posY)

    const detalhes = [
        ['Salário base de férias', formatarMoedaPDF(resultado.salarioFerias)],
        ['1/3 constitucional', '+ ' + formatarMoedaPDF(resultado.umTerco)],
    ]
    if (resultado.abono) {
        detalhes.push(['Abono pecuniário (10 dias)', formatarMoedaPDF(resultado.abonoPecuniario)])
    }
    detalhes.push(['INSS', '- ' + formatarMoedaPDF(resultado.inss)])
    if (resultado.irrf > 0) {
        detalhes.push(['IRRF', '- ' + formatarMoedaPDF(resultado.irrf)])
    } else {
        detalhes.push(['IRRF', 'Isento'])
    }
    detalhes.push(['Férias Líquidas', formatarMoedaPDF(resultado.totalLiquido)])

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
    criarTotalDestacado(doc, posY, 'TOTAL LÍQUIDO DE FÉRIAS', resultado.totalLiquido)

    if (!isPremium) adicionarMarcaDagua(doc)
    criarFooter(doc, isPremium, email)
    doc.save(`ferias-${new Date().getFullYear()}.pdf`)
}

// =====================================================
// 4. DÉCIMO TERCEIRO SALÁRIO
// =====================================================
export function exportarDecimoTerceiroPDF(dados, resultado, isPremium = false, email = '') {
    const doc = new jsPDF()
    criarHeader(doc, 'Relatório de 13º Salário', isPremium)

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Dados do Cálculo', 14, 48)

    autoTable(doc, {
        startY: 53,
        body: [
            ['Salário Bruto', formatarMoedaPDF(dados.salarioBruto)],
            ['Meses trabalhados no ano', String(resultado.avos) + '/12'],
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
    doc.text('Detalhamento', 14, posY)

    const parcelas = [
        ['Valor bruto do 13º', formatarMoedaPDF(resultado.valorBruto)],
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

    if (!isPremium) adicionarMarcaDagua(doc)
    criarFooter(doc, isPremium, email)
    doc.save(`decimo-terceiro-${new Date().getFullYear()}.pdf`)
}

// =====================================================
// 5. HORAS EXTRAS
// =====================================================
export function exportarHorasExtrasPDF(dados, resultado, isPremium = false, email = '') {
    const doc = new jsPDF()
    criarHeader(doc, 'Relatório de Horas Extras', isPremium)

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

    if (!isPremium) adicionarMarcaDagua(doc)
    criarFooter(doc, isPremium, email)
    doc.save(`horas-extras-${new Date().getFullYear()}.pdf`)
}

// =====================================================
// 6. SEGURO-DESEMPREGO
// =====================================================
export function exportarSeguroDesempregoPDF(dados, resultado, isPremium = false, email = '') {
    const doc = new jsPDF()
    criarHeader(doc, 'Relatório de Seguro-Desemprego', isPremium)

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Dados do Cálculo', 14, 48)

    const vezesLabel = {
        '0': '1ª solicitação (nunca recebeu)',
        '1': '2ª solicitação (recebeu 1 vez)',
        '2': '3ª+ solicitação (recebeu 2+ vezes)',
    }

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

    if (!isPremium) adicionarMarcaDagua(doc)
    criarFooter(doc, isPremium, email)
    doc.save(`seguro-desemprego-${new Date().getFullYear()}.pdf`)
}