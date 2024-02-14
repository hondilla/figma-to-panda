import { config } from "../config.js";
import { FileLoader } from "./fileLoader.js";

export class TokensLoader {
  #tokens = {};
  #extensions = {};
  #replacebleTokens = {};

  constructor() {
    this.loader = new FileLoader();
  }

  tokens() {
    this.#loadTokens();

    this.#tokens = this.#removeProperties(this.#tokens);
    this.#tokens = this.#replaceTokens(this.#tokens);
    this.#tokens = this.#applyExtensions(this.#tokens);

    return this.#tokens;
  }

  #loadTokens() {
    this.#tokens = this.loader
      .load(config.tokensPath + "/" + config.metadataFile)
      .tokenSetOrder.reduce((acc, tokensName) => {
        let tokens = this.loader.load(
          config.tokensPath + "/" + tokensName + ".json"
        );

        const category = this.#getCategory(tokensName);
        const type = this.#getType(tokens);

        const parsedTokens = this.#parse(tokens, tokensName);

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

      if(config.mappings.replaceTokensValue.includes(key)) {
        this.#replacebleTokens[key] = tokens[key];
        delete tokens[key];
      }

      if(config.mappings.ignoreTokens.includes(key)) {
        delete tokens[key];
      }

      if (config.mappings.extensions[key]?.key) {
        this.#extensions[key] = tokens[key];
        delete tokens[key];
      }

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
            .filter((props) => props.includes("value"))
            .reduce((obj, key) => {
              if (tokens["$extensions"] === undefined) {
                obj[key] = tokens[key];
              } else {
                obj[key] = {
                  value: tokens[key],
                  ...tokens["$extensions"]["studio.tokens"],
                };
              }
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

  #removeProperties(tokens) {
    for (let key in tokens) {
      if (
        typeof tokens[key] === "object" &&
        Object.keys(tokens[key]).length > 0 &&
        !key.includes(config.mappings.ignoreProperties)
      ) {
        tokens[key] = this.#removeProperties(tokens[key]);
      } else {
        if (config.mappings.ignoreProperties.includes(key)) {
          delete tokens[key];
        }
      }
    }
    return tokens;
  }

  #replaceTokens(tokens) {
    for (let key in tokens) {
      if (
        typeof tokens[key] === "object" &&
        Object.keys(tokens[key]).length > 0 &&
        !key.includes(Object.keys(this.#replacebleTokens))
      ) {
        tokens[key] = this.#replaceTokens(tokens[key]);
      } else {
        if(tokens[key].includes(Object.keys(this.#replacebleTokens))) {
          tokens[key] = tokens[key]
            .replace("{", "")
            .replace("}", "")
            .split(".")
            .reduce((o, i) => o[i], this.#replacebleTokens).value;
        }
      }
    }
    return tokens;
  }

  #applyExtensions(tokens) {
    for (let key in tokens) {
      if (
        typeof tokens[key] === "object" &&
        Object.keys(tokens[key]).length > 0 &&
        key !== "value"
      ) {
        tokens[key] = this.#applyExtensions(tokens[key]);
      } else {
        const extensions = config.mappings.extensions;
        Object.keys(extensions).forEach((extension) => {
          if (typeof tokens[key] === "object" && tokens[key][extensions[extension].key] !== undefined) {
            tokens[key].value = extensions[extension].transformer(
              this.#tokens,
              this.#extensions[extension],
              tokens[key].value,
              tokens[key][extensions[extension].key]
            );
          }
        });
        tokens[key] = tokens[key]?.value || tokens[key];
      }
    }
    return tokens;
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
