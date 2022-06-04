import React, { useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
import SyncLoader from "react-spinners/SyncLoader"
import "./App.css"
import Api from "./api/api"

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
  },
  paper: {
    height: 140,
    width: 100,
  },
  control: {
    padding: theme.spacing(2),
  },
}))

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
}
function App() {
  const [values, setValues] = useState("")
  const [spinner, setSpinner] = useState(false)
  const [respostas, setRespostas] = useState([])
  const classes = useStyles()

  const raiseInvoiceClicked = link => {
    window.open(link, "_blank")
  }

  const handleChange = prop => event => {
    setValues({ ...values, [prop]: event.target.value })
    console.log(event.target.value)
  }

  const pedeComida = async ({ endereco, comida, numero, cidade }) => {
    endereco = endereco + numero + cidade
    console.log(endereco)
    try {
      setSpinner(true)
      setRespostas([])
      const response = await Api.post(
        "/foods",
        { endereco, comida },
        { headers: headers }
      )
      setRespostas(response.data.sort((a, b) => (a.total > b.total ? 1 : -1)))
    } catch (err) {
      setSpinner(false)
      // alert("Algo deu errado, reveja seu endereço e comida")
    }
  }

  return (
    <div>
      <div className="App">
        <div>
          <h1 style={{ paddingLeft: 10 }}>
            iPrice o melhor preço para sua refeição
          </h1>
        </div>

        <h4 style={{ paddingLeft: 10 }}>
          {" "}
          O tempo médio para a resposta da pesquisa é de 30s
        </h4>
        <div>
          <h3>Rua</h3>
          <input
            onChange={handleChange("endereco")}
            value={values.endereco}
            className="pesquisa"
            placeholder="Ex: Av brasil"
          />{" "}
          <h3>Número</h3>{" "}
          <input
            onChange={handleChange("numero")}
            value={values.numero}
            className="pesquisa"
            placeholder="Ex: 000"
          />
          <h3>Cidade</h3>{" "}
          <input
            onChange={handleChange("cidade")}
            value={values.cidade}
            className="pesquisa"
            placeholder="Ex: São Paulo"
          />
          <h3>Comida</h3>
          <input
            onChange={handleChange("comida")}
            value={values.comida}
            className="pesquisa"
            placeholder="Ex: Pizza"
          />
        </div>

        <button onClick={() => pedeComida(values)} className="botao">
          Pesquisar
        </button>
      </div>
      <div>
        {respostas.length > 1 ? (
          <div>
            <Grid container className={classes.root} spacing={2}>
              <Grid item xs={12}>
                <Grid container justify="center" spacing={2}>
                  {respostas.map((comida, i) => (
                    <Grid key={i} className="grid" item>
                      <div className="allCard">
                        <div className="image">
                          <img
                            style={{
                              width: "100%",
                              height: "100%",
                            }}
                            src={comida.img}
                          />
                          {comida.status !== "Fechado" ? null : (
                            <span class="spanStatus">{comida.status}</span>
                          )}
                        </div>

                        <img className="logo" src={comida.logo} />
                        <div className="info">
                          <div className="topContent">
                            <h3 className="title">{comida.titulo}</h3>
                            <span className="desc">{comida.desc}</span>
                          </div>

                          <span className="price">
                            {comida.tempo} Total: R${comida.total}{" "}
                          </span>
                          <button
                            className="botao cardbotao"
                            onClick={() => raiseInvoiceClicked(comida.link)}>
                            Faça seu pedido
                          </button>
                        </div>
                      </div>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
            <SyncLoader size={15} color={"#c93e1f"} loading={spinner} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
