const Bytez = require("bytez.js");
const { pathToFileURL } = require("url");
const fs = require("fs");

exports.addSymptoms = (req, res) => {
  console.log("Add symptoms controller reached");
  const formData = req.body;
  console.log(formData);
  return res
    .status(200)
    .json({ message: "Symptoms added successfully", data: formData });
};

exports.patientData = (req, res) => {
  console.log("reched to the patient data");
  // console.log(req.session.user);
  const patientData = req.body;
  // console.log(patientData.data);
  // insert your key
  const sdk = new Bytez("eb1bac3b9e2f5bbd6c300ed7051c9d89");

  // choose your model
  const model = sdk.model("Qwen/Qwen3-4B");

  // provide the model with input
  const input = [
    {
      role: "system",
      content:
        "You are a professional and compassionate doctor who provides clear, accurate, precise(if possible less than 5 linesresponse) and safe medical advice. Always remind users to consult a real doctor for serious issues. Use a calm and caring tone.",
    },
    {
      role: "assistant",
      content:
        "Hello, I’m Dr. ChatCare — your virtual doctor. How can I help you with your health concerns today?",
    },
    {
      role: "user",
      content: patientData.data,
    },
  ];

  const main = async () => {
    // send to the model
    const { error, output } = await model.run(input);
    // console.log({ error, output });
    if (error) {
      return res
        .status(401)
        .json({ message: "Something went wrong , sorry for inconvinience" });
    }
    // observe the output

    return res.status(200).json({ message: output });
  };
  main();
};

exports.patientVoiceData = (req, res) => {
  console.log("File received:", req.file);
  // insert your key
  const sdk = new Bytez("eb1bac3b9e2f5bbd6c300ed7051c9d89");

  // choose your model
  const model = sdk.model("facebook/data2vec-audio-base-960h");

  // provide the model with input
  const filePath = req.file.path.replace(/\\/g, "/"); // this gives you the full path, like "uploads/1234-voice.webm"
  const fileUrl = pathToFileURL(filePath).href;
  console.log("File URL:", fileUrl);

  const input = { url: fileUrl };

  const main = async () => {
    const { error, output } = await model.run(input);
 
    // observe the output
    // console.log({ error, output });
    res.json({ message: "Voice received successfully!" });
  };
  // send to the model

  // observe the output

  

  main();
};
