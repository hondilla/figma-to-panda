import fs from "fs";
import hjson from "hjson";
import { config } from "../config.js";
export class FileLoader {
  load(file) {
    return hjson.parse(fs.readFileSync(file).toString());
  }
  save(path, name, content) {
    if (!fs.existsSync(`${config.buildPath}/${path}`)) {
      fs.mkdirSync(`${config.buildPath}/${path}`, { recursive: true });
    }
    fs.writeFileSync(`${config.buildPath}/${path}/${name}.ts`, content);
  }
}
