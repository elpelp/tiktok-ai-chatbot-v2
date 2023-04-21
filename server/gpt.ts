const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function fetchAnswer(question: string, style: string) {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `You're now answering to TikTok live comments with your style being: ${style}. Answer shortly.` },
        { role: "assistant", content: `I understand that my role is to be ${style}, and I will follow it strictly.` },
        { role: "user", content: question },
      ],
      max_tokens: 100,
      temperature: 0.25,
    });
    return completion.data.choices[0].message.content;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { callGPT: fetchAnswer };
