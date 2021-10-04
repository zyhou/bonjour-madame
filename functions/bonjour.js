const { JSDOM } = require("jsdom");
const { WebhookClient } = require("discord.js");

const BM_URL = "https://www.bonjourmadame.fr/";

function getMadameData() {
  return JSDOM.fromURL(BM_URL).then(({ window }) => {
    const { document } = window;

    const rawUrl =
      document.querySelector(".post-content").children[0].children[0].src;
    if (!rawUrl) {
      throw new Error("Madame est introuvable :-(");
    }

    const title = document
      .querySelector(".post-title")
      .textContent.replace(/\t/g, "")
      .replace(/\n/g, "");

    const picture = rawUrl.split("?")[0];
    return { picture, title };
  });
}

exports.handler = async function (event, context) {
  const madameData = await getMadameData();

  const webhookClient = new WebhookClient({
    url: process.env.WEBHOOK_URL,
  });

  webhookClient.send({
    content: madameData.title,
    username: "Bonjour Madame",
    files: [madameData.picture],
  });

  return { statusCode: 200, body: JSON.stringify({ ...madameData }) };
};
