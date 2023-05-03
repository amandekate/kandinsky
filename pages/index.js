import { useEffect, useState } from "react";
import Head from "next/head";
import { aspectRatios } from "../utils";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const lensTypes = ["50 mm", "35 mm", "105 mm"];
const cameraAngles = ["wide angle", "close up"];
// const aspectRatios = ["1:1", "4:3", "16:9", "21:9"];

export default function Home() {
  const [formData, setFormData] = useState({
    prediction: "",
    error: null,
    category: "",
    aspectRatio: "",
    lensType: "",
    cameraAngle: "",
    prompt: "",
    finalPrompt: "",
    height: 0,
    width: 0,
    camera: "",
    settings: "",
  });

  // const [prediction, setPrediction] = useState(null);
  // const [error, setError] = useState(null);
  // const [category, setCategory] = useState(null);
  // const [aspectRatio, setAspectRatio] = useState("");
  const {
    category,
    aspectRatio,
    cameraAngle,
    lensType,
    prompt,
    error,
    prediction,
    camera,
    settings,
  } = formData;
  const handleChange = (e) => {
    console.log(e.target.value);
    e.preventDefault();
    if (e.target.name === "aspectRatio") {
      const { width, height } = aspectRatios[e.target.value];
      console.log(width, height);
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    console.log("Form Data - ", formData);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalBuildPrompt = `${cameraAngle} ${prompt} , category- ${category} , lens type - ${lensType}, camera - ${camera}, settings - ${settings}  `;
    setFormData({
      ...formData,
      finalPrompt: finalBuildPrompt,
    });
    await fetchPrediction(finalBuildPrompt);
  };

  const fetchPrediction = async (finalBuildPrompt) => {
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: finalBuildPrompt,
        aspectRatio: aspectRatio,
      }),
    });
    let _prediction = await response.json();
    if (response.status !== 201) {
      setFormData({ ...formData, error: _prediction.detail });
      return;
    }
    setFormData({ ...formData, prediction: _prediction });

    while (
      _prediction.status !== "succeeded" &&
      _prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + _prediction.id);
      _prediction = await response.json();
      if (response.status !== 200) {
        setFormData({ ...formData, error: _prediction.detail });
        return;
      }
      console.log({ _prediction });
      setFormData({ ...formData, prediction: _prediction });
    }
  };

  return (
    <div className="flex flex-col p-2">
      <Head>
        <title>Kandinsky</title>
      </Head>

      <h1 className="py-6 text-center font-bold text-2xl">
        Dream something with{" "}
        <a href="https://replicate.com/ai-forever/kandinsky-2">Kandinsky</a>
      </h1>
      <div className="flex">
        <form className="flex flex-col gap-2 " onSubmit={handleSubmit}>
        
          <input
            type="text"
            className="h-20 py-8"
            name="prompt"
            id="prompt"
            onChange={handleChange}
            value={prompt}
            placeholder="Enter a prompt to display an image"
          />

          <input
            type="text"
            className=""
            name="camera"
            id="camera"
            onChange={handleChange}
            value={camera}
            placeholder="Enter camera name"
          />
          <label for="camera" className="text text-gray-400 p-1" >Ex- Canon EOS 5D Mark IV DSLR</label>

          <input
            type="text"
            className=""
            name="settings"
            id="settings"
            onChange={handleChange}
            value={settings}
            placeholder="Enter camera settings"
          />
          <label for="settings" className="text text-gray-400 p-1" >Ex - f/5.6 Aperture, Shutter Speed- 1/125 Sec, ISO - 100 </label>
          <select
            name="category"
            value={category}
            onChange={handleChange}
            className="border rounded-md"
          >
            <option value="">Select a Category</option>
            <option value="Fashion">Fashion</option>
            <option value="Food">Food</option>
            <option value="Short Film">Short Film</option>
            <option value="Movie">Movie</option>
          </select>

          <select
            name="lensType"
            className="border rounded-md"
            value={lensType}
            onChange={handleChange}
          >
            <option value={null}>Select a Lens type</option>
            {lensTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            name="cameraAngle"
            className="border rounded-md"
            value={cameraAngle}
            onChange={handleChange}
          >
            <option value="">Select a Camera angle</option>
            {cameraAngles.map((angle) => (
              <option key={angle} value={angle}>
                {angle}
              </option>
            ))}
          </select>

          <select
            className="border rounded-md"
            name="aspectRatio"
            value={aspectRatio}
            onChange={handleChange}
          >
            <option value={{}}>Select an aspect ratio</option>
            {aspectRatios.map((ratio, i) => (
              <option key={i} value={i}>
                {`${ratio.aspectRatio} - (${ratio.width}x${ratio.height})`}
              </option>
            ))}
          </select>

          <button
            className="button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
            disabled={!prompt && prompt.length <= 0}
          >
            Generate Image
          </button>
        </form>
        <div className="flex flex-col flex-1">
          {error && <div>{error}</div>}

          {prediction && (
            <>
              {prediction.output &&
                prediction.output.map((item, i) => (
                  <div className=" p-1 flex flex-wrap " key={i}>
                    <img
                      src={item}
                      alt="output"
                    />
                  </div>
                ))}
              <p className="py-3 text-sm opacity-50">
                status: {prediction.status}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
