/**
 * Módulo central de cálculos
 * Carrega tabelas.json e detecta automaticamente o ano mais recente com dados preenchidos.
 * Para actualizar: abrir /public/tabelas.json e preencher os valores do novo ano.
 */

import allTabelas from '../data/tabelas.json'

// ========== Detecção automática do ano ==========
// Percorre do ano actual para trás até encontrar um ano com salarioMinimo > 0
function detectarAno() {
  const anoActual = new Date().getFullYear()

  // Primeiro tenta o ano actual
  if (allTabelas[anoActual] && allTabelas[anoActual].salarioMinimo > 0) {
    return anoActual
  }

  // Se não tem dados para o ano actual, procura o mais recente preenchido
  for (let ano = anoActual - 1; ano >= 2026; ano--) {
    if (allTabelas[ano] && allTabelas[ano].salarioMinimo > 0) {
      return ano
    }
  }

  // Fallback
  return 2026
}

const ANO_ACTIVO = detectarAno()
const tabelasData = allTabelas[ANO_ACTIVO]

// ========== Exports ==========
export const TABELAS = { ...tabelasData, ano: ANO_ACTIVO }
export const SALARIO_MINIMO = tabelasData.salarioMinimo
export const TETO_INSS = tabelasData.tetoINSS
export const ANO = ANO_ACTIVO
export const TODOS_ANOS = allTabelas

// ========== INSS ==========
export function calcularINSS(salarioBruto) {
  const base = Math.min(salarioBruto, tabelasData.tetoINSS)
  if (base <= 0) return 0

  const faixas = tabelasData.inss
  for (const faixa of faixas) {
    if (base >= faixa.min && base <= faixa.max) {
      return Math.round((base * faixa.aliquota - faixa.deducao) * 100) / 100
    }
  }

  // Acima do teto
  const ultima = faixas[faixas.length - 1]
  return Math.round((tabelasData.tetoINSS * ultima.aliquota - ultima.deducao) * 100) / 100
}

// ========== IRRF ==========
export function calcularIRRF(baseCalculo, dependentes = 0) {
  const base = baseCalculo - (dependentes * tabelasData.deducaoDependenteIR)
  if (base <= 0) return 0

  let irBruto = 0
  for (const faixa of tabelasData.irrf) {
    if (base >= faixa.min && base <= faixa.max) {
      irBruto = Math.max(0, base * faixa.aliquota - faixa.deducao)
      break
    }
  }

  if (irBruto <= 0) return 0

  // Redutor mensal
  const { isencaoAte, reducaoAte } = tabelasData.redutorIR
  let reducao = 0
  if (isencaoAte > 0) {
    if (base <= isencaoAte) {
      reducao = irBruto
    } else if (reducaoAte > 0 && base <= reducaoAte) {
      reducao = irBruto * (reducaoAte - base) / (reducaoAte - isencaoAte)
    }
  }

  const irFinal = Math.max(0, irBruto - reducao)
  return Math.round(irFinal * 100) / 100
}

// ========== Utilidades ==========
export function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatarPercentual(valor) {
  return (valor * 100).toFixed(1).replace('.', ',') + '%'
}
