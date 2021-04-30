const fs = require("fs");
const sharp = require("sharp");

const imageFormats = ["jpg", "jpeg", "png", "gif", "webp"];
const defaultSizes = [
  { size: [200, 150], suffix: "mini" },
  { size: [400, 300], suffix: "mid" },
  { size: [800, 600], suffix: "large" },
];

const getExtension = (fileName) =>
  fileName.split(".").slice(-1)[0]?.toLowerCase() ?? "";

const removeExtension = (fileName) =>
  fileName.split(".").slice(0, -1).join(".");

const resizeImageToSizes = async (fileName, sizes, outPrefix = "") => {
  await Promise.all(
    sizes.map(async (sizeDefinition) => {
      const { size, suffix } = sizeDefinition;
      const newFileName = `${outPrefix}${removeExtension(fileName)}.${suffix}`;
      const resized = sharp(fileName).resize(size[0], size[1]);
      await resized.webp().toFile(`${newFileName}.webp`);
      await resized.jpeg().toFile(`${newFileName}.jpg`);
    })
  );
};

const run = async () => {
  let files = [];
  try {
    const data = fs.readFileSync("./list.json");
    if (data) {
      files = JSON.parse(data);
    }
  } catch (e) {}

  if (files.length === 0) {
    try {
      const dir = fs.readdirSync(".");
      files = dir.filter((fileName) =>
        imageFormats.includes(getExtension(fileName))
      );
    } catch (e) {}
  }

  if (files.length === 0) {
    console.warn("No files in the current directory or in the config");
    return;
  }

  try {
    fs.mkdirSync("out");
    console.log("[INFO] Created new directory ./out");
  } catch (e) {
    if (e.code !== "EEXIST") {
      throw e;
    }
    console.log("[INFO] out directory already exists");
  }

  files.map((fileName) => {
    resizeImageToSizes(fileName, defaultSizes, "out/");
  });
  await Promise.all(files);
};

run();
