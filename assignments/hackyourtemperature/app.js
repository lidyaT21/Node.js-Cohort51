import express from "express";
import fetch from "node-fetch";
import keys from "./sources/keys.js";
const app = express();

app.use(express.json());

app.post("/weather", async (req, res) => {
  let { cityName } = req.body;
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?&q=${cityName}&appid=${keys.API_KEY}`;
  if (!cityName) {
    return res.status(404).send("You need to provide a city name");
  }
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("API not found ");
    }
    const data = await response.json();
    const temp = data.main.temp;
    const tempCelsius = temp - 273.15;
    data.main.temp = tempCelsius;
    res.send({
      weatherText: `The weather in ${cityName} is ${tempCelsius.toFixed(
        0
      )} degrees Celsius.`,
    });
  } catch {
    res.status(500).send({ weatherText: `City not found: ${cityName}` });
  }
});

app.get("/", (req, res) => {
  res.send("hello from backend to frontend!");
});

export default app;
