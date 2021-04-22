const fs = require("fs");
const sharp = require("sharp");

const imageFormats = ["jpg", "jpeg", "png", "gif"];
const defaultSizes = [
  { size: [400, 300], suffix: "mid" },
  { size: [200, 150], suffix: "mini" },
  { size: [800, 600], suffix: "large" },
];

const getExtension = (fileName) =>
  fileName.split(".").slice(-1)[0]?.toLowerCase() ?? "";

const removeExtension = (fileName) =>
  fileName.split(".").slice(0, -1).join(".");

const resizeImageToSizes = (fileName, sizes, outPrefix = '') => {
  sizes.forEach((size) => {
    const newFileName = `${outPrefix}${removeExtension(fileName)}-${
      size.suffix
    }.${getExtension(fileName)}`;
    sharp(fileName).resize(size[0], size[1]).toFile(newFileName);
  });
};

const run = () => {
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

  files.forEach(fileName=>{
      resizeImageToSizes(fileName, defaultSizes, 'out/')
  })
};

run();
