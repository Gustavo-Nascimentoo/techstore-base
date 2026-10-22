export function formatarPreco(valor) {
  const texto = String(valor ?? '').trim().replace(/R\$/g, '').replace(/\s+/g, '')

  if (!texto) {
    return 'Preço indisponível'
  }

  const numero = texto.includes(',') && texto.includes('.')
    ? Number(texto.replace(/\./g, '').replace(',', '.'))
    : texto.includes(',')
      ? Number(texto.replace(',', '.'))
      : Number(texto)

  if (!Number.isFinite(numero)) {
    return 'Preço indisponível'
  }

  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
