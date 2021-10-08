const { JSDOM } = require("jsdom");
const { WebhookClient } = require("discord.js");

const BM_URL = "https://www.bonjourmadame.fr/";

async function getMadameData() {
  return JSDOM.fromURL(BM_URL).then(({ window }) => {
    const { document } = window;

    const rawUrl = document.querySelector(".post-content img").src;
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

async function sendMadame() {
  const madameData = await getMadameData();

  const webhookClient = new WebhookClient(
    process.env.WEBHOOK_ID,
    process.env.WEBHOOK_TOKEN
  );

  await webhookClient.send({
    content: madameData.title,
    username: "Bonjour Madame",
    files: [madameData.picture],
  });

  return madameData;
}

exports.handler = async function () {
  try {
    const madameData = await sendMadame();
    return { statusCode: 200, body: JSON.stringify(madameData) };
  } catch (error) {
    console.error({ error });
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
