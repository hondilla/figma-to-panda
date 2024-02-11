import { TokensLoader } from "./tokensLoader.js";

class TokensToPanda {
  constructor() {
    this.tokens = new TokensLoader();
    console.log(JSON.stringify(this.tokens.tokens()))
  }
}

new TokensToPanda();
