import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router'
import Header from './components/Header'
import Footer from './components/Footer'
import RolarParaTopo from './components/RolarParaTopo'
import Loja from './pages/Loja'
import PaginaProduto from './pages/PaginaProduto'
import Carrinho from './pages/Carrinho'
import Estoque from './pages/Estoque'
import { buscarProdutos } from './services/produtos'
import { buscarClientes } from './services/clientes'
import { produtoTemPrecoValido } from './utils/carrinho'

const STORAGE_KEY = 'techstore-lista-espera'
const STORAGE_KEY_CARRINHO = 'techstore-carrinho-cliente'

function getCarrinhoStorageKey(clienteId) {
  return `${STORAGE_KEY_CARRINHO}-${clienteId}`
}

function useListaEsperaPersistida() {
  const [listaEspera, setListaEspera] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY)
      if (!salvo) {
        return []
      }

      const itens = JSON.parse(salvo)
      return Array.isArray(itens) ? itens : []
    } catch (erroLocalStorage) {
      console.warn('Não foi possível restaurar a lista de espera:', erroLocalStorage)
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listaEspera))
    } catch (erroLocalStorage) {
      console.warn('Não foi possível salvar a lista de espera:', erroLocalStorage)
    }
  }, [listaEspera])

  return [listaEspera, setListaEspera]
}

function useCarrinhoPorCliente(clienteAtualId) {
  const [carrinho, setCarrinho] = useState([])

  useEffect(() => {
    if (!clienteAtualId) {
      setCarrinho([])
      return
    }

    try {
      const salvo = localStorage.getItem(getCarrinhoStorageKey(clienteAtualId))
      if (!salvo) {
        setCarrinho([])
        return
      }

      const itens = JSON.parse(salvo)
      setCarrinho(Array.isArray(itens) ? itens : [])
    } catch (erroLocalStorage) {
      console.warn('Não foi possível restaurar o carrinho do cliente:', erroLocalStorage)
      setCarrinho([])
    }
  }, [clienteAtualId])

  useEffect(() => {
    if (!clienteAtualId) {
      return
    }

    try {
      localStorage.setItem(getCarrinhoStorageKey(clienteAtualId), JSON.stringify(carrinho))
    } catch (erroLocalStorage) {
      console.warn('Não foi possível salvar o carrinho do cliente:', erroLocalStorage)
    }
  }, [carrinho, clienteAtualId])

  return [carrinho, setCarrinho]
}

export default function App() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [clientes, setClientes] = useState([])
  const [clienteAtualId, setClienteAtualId] = useState(null)
  const [carrinho, setCarrinho] = useCarrinhoPorCliente(clienteAtualId)
  const [listaEspera, setListaEspera] = useListaEsperaPersistida()
  const [produtoDuplicado, setProdutoDuplicado] = useState(null)
  const [produtoEsgotado, setProdutoEsgotado] = useState(null)

  useEffect(() => {
    buscarProdutos()
      .then((dados) => setProdutos(dados))
      .catch(() => setErro('Não foi possível carregar os produtos.'))
      .finally(() => setCarregando(false))

    buscarClientes().then((dados) => {
      setClientes(dados)
      if (dados.length > 0) setClienteAtualId(String(dados[0].id))
    })
  }, [])

  function adicionarAoCarrinho(produto) {
    if (!produto || !produtoTemPrecoValido(produto)) {
      return
    }

    const estoqueDisponivel = Number(produto.estoque) || 0
    if (estoqueDisponivel <= 0) {
      setProdutoEsgotado(produto)
      return
    }

    const quantidadeNoCarrinho = carrinho.filter((item) => item.id === produto.id).length
    const jaExisteNoCarrinho = quantidadeNoCarrinho > 0

    if (jaExisteNoCarrinho) {
      setProdutoDuplicado(produto)
      return
    }

    setCarrinho((atual) => atual.concat(produto))
    setProdutos((atual) =>
      atual.map((item) =>
        item.id === produto.id ? { ...item, estoque: Math.max(0, Number(item.estoque) - 1) } : item
      )
    )
  }

  function confirmarDuplicado() {
    if (!produtoDuplicado) {
      return
    }

    const estoqueDisponivel = Number(produtoDuplicado.estoque) || 0
    if (estoqueDisponivel <= 0) {
      setProdutoDuplicado(null)
      setProdutoEsgotado(produtoDuplicado)
      return
    }

    setCarrinho((atual) => atual.concat(produtoDuplicado))
    setProdutos((atual) =>
      atual.map((item) =>
        item.id === produtoDuplicado.id
          ? { ...item, estoque: Math.max(0, Number(item.estoque) - 1) }
          : item
      )
    )
    setProdutoDuplicado(null)
  }

  function cancelarDuplicado() {
    setProdutoDuplicado(null)
  }

  function fecharProdutoEsgotado() {
    setProdutoEsgotado(null)
  }

  function removerUmaUnidade(produtoId) {
    const produtoSelecionado = carrinho.find((produto) => produto.id === produtoId)

    if (!produtoSelecionado) {
      return
    }

    setCarrinho((atual) => {
      const indiceParaRemover = atual.findIndex((produto) => produto.id === produtoId)

      if (indiceParaRemover === -1) {
        return atual
      }

      return atual.filter((_, indice) => indice !== indiceParaRemover)
    })

    setProdutos((atual) =>
      atual.map((produto) =>
        produto.id === produtoId ? { ...produto, estoque: Number(produto.estoque) + 1 } : produto
      )
    )
  }

  function registrarAviso(produto, cliente) {
    if (!produto || !cliente || !cliente.email) {
      return
    }

    const novoAviso = {
      produtoId: produto.id,
      produtoTitle: produto.title,
      categoria: produto.category,
      nome: cliente.nome,
      email: cliente.email,
    }

    setListaEspera((atual) => {
      const jaCadastrado = atual.some(
        (item) => item.produtoId === novoAviso.produtoId && item.email === novoAviso.email
      )

      return jaCadastrado ? atual : [...atual, novoAviso]
    })
  }

  const clienteAtual = clientes.find(
    (cliente) => String(cliente.id) === String(clienteAtualId)
  )

  return (
    <div className="app">
      <RolarParaTopo />
      <Header carrinho={carrinho} clienteAtual={clienteAtual} />

      {produtoDuplicado && (
        <div className="modal-overlay" onClick={cancelarDuplicado}>
          <div className="modal-confirmacao" onClick={(evento) => evento.stopPropagation()}>
            <p className="modal-titulo">Já adicionou esse item?</p>
            <p className="modal-texto">Gostaria de adiciona-lo novamente?</p>
            <div className="modal-acoes">
              <button className="botao-modal botao-modal-confirmar" onClick={confirmarDuplicado}>
                Confirmar
              </button>
              <button className="botao-modal botao-modal-cancelar" onClick={cancelarDuplicado}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {produtoEsgotado && (
        <div className="modal-overlay" onClick={fecharProdutoEsgotado}>
          <div className="modal-confirmacao modal-confirmacao-grande" onClick={(evento) => evento.stopPropagation()}>
            <p className="modal-titulo modal-titulo-grande">Item Esgotado</p>
            <p className="modal-texto modal-texto-grande">
              Não há mais unidades disponíveis deste produto no momento.
            </p>
            <div className="modal-acoes modal-acoes-centralizadas">
              <button className="botao-modal botao-modal-ok" onClick={fecharProdutoEsgotado}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="conteudo">
        {carregando && <p className="aviso">Carregando produtos...</p>}
        {erro && <p className="aviso aviso-erro">{erro}</p>}

        {!carregando && !erro && (
          <Routes>
            <Route
              path="/"
              element={<Loja produtos={produtos} onAdicionar={adicionarAoCarrinho} />}
            />
            <Route
              path="/produto/:id"
              element={
                <PaginaProduto
                  produtos={produtos}
                  onAdicionar={adicionarAoCarrinho}
                  onRegistrarAviso={registrarAviso}
                  clienteAtual={clienteAtual}
                />
              }
            />
            <Route
              path="/carrinho"
              element={
                <Carrinho
                  carrinho={carrinho}
                  produtos={produtos}
                  clienteAtual={clienteAtual}
                  onAdicionar={adicionarAoCarrinho}
                  onRemover={removerUmaUnidade}
                />
              }
            />
            <Route path="/estoque" element={<Estoque produtos={produtos} listaEspera={listaEspera} />} />
          </Routes>
        )}
      </main>

      <Footer
        clientes={clientes}
        clienteAtualId={clienteAtualId}
        onTrocarCliente={setClienteAtualId}
      />
    </div>
  )
}
