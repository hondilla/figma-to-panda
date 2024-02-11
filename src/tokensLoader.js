import { config } from "../config.js";
import { FileLoader } from "./fileLoader.js";

export class TokensLoader {
  constructor() {
    this.loader = new FileLoader();
  }

  tokens() {
    return this.loader
      .load(config.tokensPath + "/" + config.metadataFile)
      .tokenSetOrder.reduce((acc, tokensName) => {
        let tokens = this.loader.load(
          config.tokensPath + "/" + tokensName + ".json"
        );

        const category = this.#getCategory(tokensName);
        const type = this.#getType(tokens);
        const parsedTokens = this.#toLowercaseObject(
          this.#parse(tokens, tokensName)
        );

        if (category && parsedTokens[type] !== undefined) {
          tokens = { [category]: parsedTokens };
        } else if (category) {
          tokens = { [category]: { [type]: parsedTokens } };
        } else {
          tokens = { [type]: parsedTokens };
        }

        return this.#mergeDeep(acc, tokens);
      }, {});
  }

  #getCategory(tokensName) {
    return Object.keys(config.mappings.categories).find((key) =>
      config.mappings.categories[key].includes(tokensName)
    );
  }

  #getType(token) {
    for (const key in token) {
      const entry = token[key];
      if (typeof entry === "object" && entry !== null) {
        if ("type" in entry) {
          return entry.type;
        } else {
          const type = this.#getType(entry);
          if (type) {
            return config.mappings.types[type] || type;
          }
        }
      }
    }
    return null;
  }

  #parse(tokens, tokensName) {
    for (let key in tokens) {
      const mappingToken = config.mappings.tokensName[key];
      if (mappingToken !== undefined) {
        tokens[mappingToken] = tokens[key];
        delete tokens[key];
        key = mappingToken;
      }

      if (typeof tokens[key] === "string") {
        tokens = this.#normalize(tokens, tokensName);
        if (tokens.type !== undefined) {
          return Object.keys(tokens)
            .filter((props) => props === "value")
            .reduce((obj, key) => {
              obj[key] = tokens[key];
              return obj;
            }, {});
        }
      }

      if (typeof tokens[key] === "object") {
        tokens[key] = this.#parse(tokens[key], tokensName);
      }
    }
    return tokens;
  }

  #normalize(token, tokensName) {
    const conditionalToken = config.mappings.conditionalTokens[tokensName];
    if (token.value !== undefined && conditionalToken !== undefined) {
      token.value = this.#normalizeProps(token.value);
      return {
        value: {
          [conditionalToken]: this.#parse(token.value, null),
        },
      };
    }
    return token;
  }

  #normalizeProps(props) {
    if (typeof props === "object") {
      props = this.#normalizePropsValues(props);
      props = this.#normalizePropsKeys(props);
    }
    return props;
  }

  #normalizePropsKeys(props) {
    return Object.fromEntries(
      Object.entries(props).map(([k, v]) => [config.mappings.css[k] || k, v])
    );
  }

  #normalizePropsValues(props) {
    Object.keys(props).map((prop) => {
      props[prop] = props[prop].replace(
        /\{(\w+(?:\.\w+)+)\}/g,
        (match, tokens) => {
          const tokenArray = tokens.split(".");
          const mappedTokenName = config.mappings.tokensName[tokenArray[0]];

          if (mappedTokenName) {
            const mappedTokens = tokenArray.slice(1).join(".");
            return `{${mappedTokenName}.${mappedTokens}}`;
          }
          return props[prop];
        }
      );
    });
    return props;
  }

  #toLowercaseObject(tokens) {
    const newData = {};
    for (let key in tokens) {
      let newKey = key.toLowerCase();
      if (
        typeof tokens[key] === "object" &&
        Object.keys(tokens[key]).length > 0 &&
        key !== "value"
      ) {
        newData[newKey] = this.#toLowercaseObject(tokens[key]);
      } else {
        newData[newKey] = tokens[key];
      }
    }
    return newData;
  }

  #mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.#isObject(target) && this.#isObject(source)) {
      for (const key in source) {
        if (this.#isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.#mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.#mergeDeep(target, ...sources);
  }

  #isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
  }
}
