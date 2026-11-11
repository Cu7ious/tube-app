import express from "express";
import ffmpeg from "fluent-ffmpeg";
import { log } from "node:console";

const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "OK" });
});

app.post("/process-video", (req, res) => {
  const inputFilePath = req.body.inputFilePath;
  const outputFilePath = req.body.outputFilePath;

  if (!inputFilePath || !outputFilePath) {
    res
      .status(400)
      .json({ error: "[Bad Request]: Input or output file path is missing." });
  }

  // -vf means video filter;
  // -2 means keep the aspect ratio
  const ffmpegOptions = "-vf scale=-2:360";
  ffmpeg(inputFilePath)
    .outputOptions(ffmpegOptions)
    .on("end", () => {
      res.status(200).json({ status: "[Success]: Video processing finished!" });
    })
    .on("error", (err) => {
      log("[Error]:", err.message);
      res.status(500).json("Internal Server Error");
    })
    .save(outputFilePath);
});

app.listen(port, () => {
  if (process.env.NODE_ENV === "production") {
    // [TODO]: prod level logging
  } else {
    console.log("process.env.NODE_ENV:", process.env.NODE_ENV);
    console.log(`Video Processing Service listening on http://${host}:${port}`);
  }
});
