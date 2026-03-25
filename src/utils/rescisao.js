/**
 * Motor de cálculo de Rescisão Trabalhista
 * Tipos: sem justa causa, pedido de demissão, acordo mútuo (484-A), justa causa
 */

import { calcularINSS, calcularIRRF } from './calculos'

/**
 * Calcula a diferença em meses entre duas datas (para férias e 13º proporcionais)
 * Um período >= 15 dias no mês conta como 1 mês (avo)
 */
function calcularMesesTrabalhados(dataAdmissao, dataDemissao) {
  const inicio = new Date(dataAdmissao)
  const fim = new Date(dataDemissao)

  let meses = (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth())

  // Se os dias no último mês >= 15, conta como mais 1 avo
  const diaInicio = inicio.getDate()
  const diaFim = fim.getDate()

  if (diaFim >= diaInicio) {
    // Mês completo ou mais de 15 dias
    if (diaFim - diaInicio + 1 >= 15 || diaFim >= 15) {
      // ok, já contou
    }
  }

  return Math.max(0, meses)
}

/**
 * Calcula anos completos de serviço (para aviso prévio proporcional)
 */
function calcularAnosServico(dataAdmissao, dataDemissao) {
  const inicio = new Date(dataAdmissao)
  const fim = new Date(dataDemissao)
  let anos = fim.getFullYear() - inicio.getFullYear()

  // Ajustar se ainda não completou o aniversário
  const mesInicio = inicio.getMonth()
  const mesFim = fim.getMonth()
  if (mesFim < mesInicio || (mesFim === mesInicio && fim.getDate() < inicio.getDate())) {
    anos--
  }

  return Math.max(0, anos)
}

/**
 * Calcula avos de 13º proporcional no ano da rescisão
 * Conta de janeiro até o mês da rescisão
 * Dia >= 15 no mês da rescisão = conta como 1 avo
 */
function calcularAvos13(dataDemissao) {
  const fim = new Date(dataDemissao)
  let avos = fim.getMonth() // Janeiro=0, então getMonth() dá o nº de meses completos antes

  // Se trabalhou >= 15 dias no mês da rescisão, soma mais 1
  if (fim.getDate() >= 15) {
    avos += 1
  }

  return Math.min(12, Math.max(0, avos))
}

/**
 * Calcula avos de férias proporcionais
 * Conta desde o último período aquisitivo completo
 */
function calcularAvosFerias(dataAdmissao, dataDemissao) {
  const inicio = new Date(dataAdmissao)
  const fim = new Date(dataDemissao)

  // Encontrar o início do período aquisitivo atual
  let periodoInicio = new Date(inicio)
  while (true) {
    const proximo = new Date(periodoInicio)
    proximo.setFullYear(proximo.getFullYear() + 1)
    if (proximo > fim) break
    periodoInicio = proximo
  }

  // Calcular meses desde o início do período aquisitivo
  let avos = (fim.getFullYear() - periodoInicio.getFullYear()) * 12 + (fim.getMonth() - periodoInicio.getMonth())

  // Se >= 15 dias no último mês, conta mais 1
  if (fim.getDate() >= periodoInicio.getDate() || fim.getDate() >= 15) {
    avos += 1
  }

  return Math.min(12, Math.max(0, avos))
}

/**
 * Verifica se tem férias vencidas (período aquisitivo completo sem gozo)
 */
function temFeriasVencidas(dataAdmissao, dataDemissao) {
  const inicio = new Date(dataAdmissao)
  const fim = new Date(dataDemissao)
  const diffAnos = (fim - inicio) / (1000 * 60 * 60 * 24 * 365.25)
  return diffAnos >= 1
}

/**
 * Cálculo principal da rescisão
 */
export function calcularRescisao({
  salarioBruto,
  dataAdmissao,
  dataDemissao,
  tipoRescisao, // 'sem_justa_causa', 'pedido_demissao', 'acordo_mutuo', 'justa_causa'
  diasTrabalhados, // dias trabalhados no último mês (para saldo de salário)
  avisoPrevioTrabalhado, // true/false
  feriasVencidas, // true/false (tem férias vencidas?)
  dependentes, // número de dependentes para IR
  saldoFGTS, // saldo total do FGTS (informado pelo trabalhador)
}) {
  const resultado = {
    verbas: [],
    descontos: [],
    totalBruto: 0,
    totalDescontos: 0,
    totalLiquido: 0,
    fgts: null,
    seguroDesemprego: false,
  }

  const salarioDia = salarioBruto / 30
  const anosServico = calcularAnosServico(dataAdmissao, dataDemissao)
  const avos13 = calcularAvos13(dataDemissao)
  const avosFerias = calcularAvosFerias(dataAdmissao, dataDemissao)

  // ========== 1. SALDO DE SALÁRIO ==========
  const saldoSalario = salarioDia * diasTrabalhados
  resultado.verbas.push({
    nome: 'Saldo de salário',
    detalhe: `${diasTrabalhados} dias`,
    valor: saldoSalario,
    tipo: 'remuneratoria', // incide INSS e IR
  })

  // ========== 2. AVISO PRÉVIO ==========
  let diasAvisoPrevio = 0
  if (tipoRescisao === 'sem_justa_causa') {
    diasAvisoPrevio = Math.min(90, 30 + (anosServico * 3))
    if (!avisoPrevioTrabalhado) {
      const valorAviso = salarioBruto * diasAvisoPrevio / 30
      resultado.verbas.push({
        nome: 'Aviso prévio indenizado',
        detalhe: `${diasAvisoPrevio} dias`,
        valor: valorAviso,
        tipo: 'indenizatoria',
      })
    }
  } else if (tipoRescisao === 'acordo_mutuo') {
    diasAvisoPrevio = Math.min(90, 30 + (anosServico * 3))
    if (!avisoPrevioTrabalhado) {
      // No acordo mútuo, aviso indenizado = metade
      const valorAviso = (salarioBruto * diasAvisoPrevio / 30) * 0.5
      resultado.verbas.push({
        nome: 'Aviso prévio indenizado (50%)',
        detalhe: `${diasAvisoPrevio} dias × 50%`,
        valor: valorAviso,
        tipo: 'indenizatoria',
      })
    }
  }
  // Pedido de demissão: se não cumprir aviso, empregador pode descontar
  // Justa causa: sem aviso prévio

  // ========== 3. FÉRIAS PROPORCIONAIS + 1/3 ==========
  if (tipoRescisao !== 'justa_causa') {
    const feriasPropBase = (salarioBruto / 12) * avosFerias
    const feriasProporcionais = feriasPropBase + (feriasPropBase / 3)
    if (avosFerias > 0) {
      resultado.verbas.push({
        nome: 'Férias proporcionais + 1/3',
        detalhe: `${avosFerias}/12 avos`,
        valor: feriasProporcionais,
        tipo: 'indenizatoria',
      })
    }
  }

  // ========== 4. FÉRIAS VENCIDAS + 1/3 ==========
  if (feriasVencidas && tipoRescisao !== 'justa_causa') {
    const feriasVencidasValor = salarioBruto + (salarioBruto / 3)
    resultado.verbas.push({
      nome: 'Férias vencidas + 1/3',
      detalhe: '12/12 avos',
      valor: feriasVencidasValor,
      tipo: 'indenizatoria',
    })
  }

  // ========== 5. 13º SALÁRIO PROPORCIONAL ==========
  if (tipoRescisao !== 'justa_causa') {
    const decimoTerceiro = (salarioBruto / 12) * avos13
    if (avos13 > 0) {
      resultado.verbas.push({
        nome: '13º salário proporcional',
        detalhe: `${avos13}/12 avos`,
        valor: decimoTerceiro,
        tipo: 'remuneratoria',
      })
    }
  }

  // ========== CALCULAR TOTAIS BRUTOS ==========
  resultado.totalBruto = resultado.verbas.reduce((sum, v) => sum + v.valor, 0)

  // ========== 6. DESCONTOS (INSS e IRRF) ==========
  // INSS e IRRF incidem apenas sobre verbas remuneratórias (saldo salário, aviso trabalhado, 13º)
  const baseRemuneratoria = resultado.verbas
    .filter(v => v.tipo === 'remuneratoria')
    .reduce((sum, v) => sum + v.valor, 0)

  // INSS sobre verbas remuneratórias
  const inss = calcularINSS(baseRemuneratoria)
  if (inss > 0) {
    resultado.descontos.push({
      nome: 'INSS',
      detalhe: `Base: ${baseRemuneratoria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      valor: inss,
    })
  }

  // IRRF sobre (verbas remuneratórias - INSS)
  const baseIR = baseRemuneratoria - inss
  const irrf = calcularIRRF(baseIR, dependentes)
  if (irrf > 0) {
    resultado.descontos.push({
      nome: 'IRRF',
      detalhe: `Base: ${baseIR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      valor: irrf,
    })
  }

  resultado.totalDescontos = resultado.descontos.reduce((sum, d) => sum + d.valor, 0)
  resultado.totalLiquido = resultado.totalBruto - resultado.totalDescontos

  // ========== 7. FGTS ==========
  if (saldoFGTS > 0) {
    const fgtsInfo = { saldo: saldoFGTS }

    if (tipoRescisao === 'sem_justa_causa') {
      fgtsInfo.multa = saldoFGTS * 0.40
      fgtsInfo.multaPercentual = '40%'
      fgtsInfo.podeSacar = true
      fgtsInfo.totalFGTS = saldoFGTS + fgtsInfo.multa
    } else if (tipoRescisao === 'acordo_mutuo') {
      fgtsInfo.multa = saldoFGTS * 0.20
      fgtsInfo.multaPercentual = '20%'
      fgtsInfo.podeSacar = true
      fgtsInfo.saquePercentual = '80% do saldo'
      fgtsInfo.saqueLimitado = saldoFGTS * 0.80
      fgtsInfo.totalFGTS = fgtsInfo.saqueLimitado + fgtsInfo.multa
    } else if (tipoRescisao === 'pedido_demissao') {
      fgtsInfo.multa = 0
      fgtsInfo.multaPercentual = '0%'
      fgtsInfo.podeSacar = false
      fgtsInfo.totalFGTS = 0
    } else if (tipoRescisao === 'justa_causa') {
      fgtsInfo.multa = 0
      fgtsInfo.multaPercentual = '0%'
      fgtsInfo.podeSacar = false
      fgtsInfo.totalFGTS = 0
    }

    resultado.fgts = fgtsInfo
  }

  // ========== 8. DIREITO A SEGURO-DESEMPREGO ==========
  resultado.seguroDesemprego = tipoRescisao === 'sem_justa_causa'

  // Arredondar todos os valores
  resultado.verbas = resultado.verbas.map(v => ({ ...v, valor: Math.round(v.valor * 100) / 100 }))
  resultado.descontos = resultado.descontos.map(d => ({ ...d, valor: Math.round(d.valor * 100) / 100 }))
  resultado.totalBruto = Math.round(resultado.totalBruto * 100) / 100
  resultado.totalDescontos = Math.round(resultado.totalDescontos * 100) / 100
  resultado.totalLiquido = Math.round(resultado.totalLiquido * 100) / 100

  return resultado
}
