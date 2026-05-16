const express = require("express");
const axios = require("axios");

const app = express();

app.get("/price", async (req, res) => {
  try {
    const url = "https://snkrdunk.com/apparels/618443";
    const response = await axios.get(url);
    const html = response.data;

    const priceMatch = html.match(/"price":(\d+)/);
    const nameMatch = html.match(/"name":"(.*?)"/);
    const imageMatch = html.match(/"image":"(.*?)"/);

    const price = priceMatch ? priceMatch[1] : null;
    const name = nameMatch ? nameMatch[1] : null;
    const image = imageMatch ? imageMatch[1] : null;

    res.json({ price, name, image });
  } catch (err) {
    res.status(500).send("error");
  }
});

app.listen(3000, () => {
  console.log("サーバー起動 http://localhost:3000");
});
