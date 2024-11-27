const express = require('express')
const axios = require('axios')
const app = express()
app.use(express.json())

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyDBwPxi3jSFR0FOhZTtUwoU6tc2ZmyAlCM");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const palavraChave = 'importante'
const funcoes = {
  ObservacaoCriada: (observacao) => {
    observacao.status = 
      observacao.status.includes(palavraChave) ? 'importante' : 'comum'
      axios.post('http://localhost:10000/eventos', {
        type: 'ObservacaoClassificada',
        payload: observacao
      })
  },
  LembreteCriado: async (lembrete) => {
    const { texto } = lembrete;
    const prompt = "Dado o lembrete:" + texto + "Responda somente com a palavra 'Urgente' ou 'Normal', dependendo do conteúdo do lembrete.";
    try {
        const result = await model.generateContent(prompt);
        lembrete.status = result.response.text().trim();
        await axios.post('http://localhost:10000/eventos', {
            type: 'LembreteClassificado',
            payload: lembrete
        });
    } catch (e) {
        console.error("Erro com a API do Gemini", e.message);
    }
  }
}
app.post('/eventos', (req, res) => {
  try{
    const evento = req.body
    funcoes[evento.type](evento.payload)
  }
  catch (e){}
  res.status(200).end()
})

const port = 7000
app.listen(port, () => console.log(`Classificação. Porta ${port}.`))
