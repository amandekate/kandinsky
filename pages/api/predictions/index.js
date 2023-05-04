import Replicate from "replicate";
import { aspectRatios } from "../../../utils";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it."
    );
  }
  console.log(req.body)
  const { width = "512", height = "512" } = aspectRatios[req.body.aspectRatio];
  console.log("Width & height - ", width, height);

  const prediction = await replicate.predictions.create({
    version: "601eea49d49003e6ea75a11527209c4f510a93e2112c969d548fbb45b9c4f19f",
    // This is the text prompt that will be submitted by a form on the frontend
    input: { prompt: req.body.prompt, batch_size: 1, width, height },
  });

  if (prediction?.error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ detail: prediction.error }));
    return;
  }

  res.statusCode = 201;
  res.end(JSON.stringify(prediction));
}
