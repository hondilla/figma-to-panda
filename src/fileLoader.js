import fs from "fs";
import hjson from "hjson";

export class FileLoader {
  load(file) {
    return hjson.parse(fs.readFileSync(file).toString());
  }
}
