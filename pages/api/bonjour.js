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
      .textContent.replaceAll("\t", "")
      .replaceAll("\n", "");

    const picture = rawUrl.split("?")[0];
    return { picture, title };
  });
}

export default async function handler(req, res) {
  const madameData = await getMadameData();

  const webhookClient = new WebhookClient({
    url: process.env.WEBHOOK_URL,
  });

  webhookClient.send({
    content: madameData.title,
    username: "Bonjour Madame",
    files: [madameData.picture],
  });

  res.status(200).json({ ...madameData });
}
