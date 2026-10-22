// O carrinho guarda uma entrada por unidade adicionada.
// Ex.: duas camisetas iguais = o mesmo produto duas vezes no array.

export const VALOR_MINIMO_FRETE_GRATIS = 200

export function parsePreco(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return 0
  }

  const texto = String(valor).trim().replace(/R\$/g, '').replace(/\s+/g, '')

  if (!texto) {
    return 0
  }

  const numero = texto.includes(',') && texto.includes('.')
    ? Number(texto.replace(/\./g, '').replace(',', '.'))
    : texto.includes(',')
      ? Number(texto.replace(',', '.'))
      : Number(texto)

  return Number.isFinite(numero) ? numero : 0
}

export function produtoTemPrecoValido(produto) {
  if (!produto) return false

  const preco = parsePreco(produto.price)
  return preco > 0
}

export function produtoDisponivel(produto) {
  if (!produto) return false
  return produto.estoque > 0 && produtoTemPrecoValido(produto)
}

export function produtoTemFreteGratis(produto) {
  if (!produtoTemPrecoValido(produto)) {
    return false
  }

  return parsePreco(produto.price) >= VALOR_MINIMO_FRETE_GRATIS
}

export function valorRestanteParaFreteGratis(produto) {
  if (!produtoTemPrecoValido(produto)) {
    return VALOR_MINIMO_FRETE_GRATIS
  }

  const restante = VALOR_MINIMO_FRETE_GRATIS - parsePreco(produto.price)
  return restante > 0 ? restante : 0
}

export function valorFaltanteParaFreteGratis(valor) {
  const total = parsePreco(valor)

  if (total >= VALOR_MINIMO_FRETE_GRATIS) {
    return 0
  }

  return Math.max(0, VALOR_MINIMO_FRETE_GRATIS - total)
}

export function calcularTotal(carrinho) {
  return carrinho.reduce((total, produto) => {
    if (!produto || !produtoTemPrecoValido(produto)) {
      return total
    }

    return total + parsePreco(produto.price)
  }, 0)
}

export function agruparItens(carrinho) {
  const itens = []
  carrinho
    .filter((produto) => produto && produtoTemPrecoValido(produto))
    .forEach((produto) => {
      const existente = itens.find((item) => item.produto.id === produto.id)
      if (existente) {
        existente.quantidade += 1
      } else {
        itens.push({ produto, quantidade: 1 })
      }
    })
  return itens
}
