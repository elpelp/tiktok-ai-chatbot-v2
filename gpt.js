var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
function fetchAnswer(question, style) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const completion = yield openai.createChatCompletion({
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
        }
        catch (error) {
            console.log(error);
        }
    });
}
module.exports = { callGPT: fetchAnswer };
