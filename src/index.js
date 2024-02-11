import { templates } from "./panda/tokenTemplate.js";
import { TokensLoader } from "./tokensLoader.js";
import { FileLoader } from "./fileLoader.js";
import { config } from "../config.js";
class TokensToPanda {
  constructor() {
    this.tokens = new TokensLoader();
  }

  generate() {
    const tokens = this.tokens.tokens();
    Object.keys(tokens).map((category) => {
      Object.keys(tokens[category]).map((key) => {
        const content = templates[category](key, tokens[category][key]);
        new FileLoader().save(config.panda[category] || category, key, content);
      });
    });
  }
}

new TokensToPanda().generate();
