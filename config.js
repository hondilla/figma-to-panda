import colorModifier from "./src/transformers/color-modifier/colorModifier.js";

export const config = {
  tokensPath: "tokens",
  metadataFile: "$metadata.json",
  buildPath: "build",

  mappings: {
    categories: {
      tokens: ["colors", "fonts", "dimensions"],
      semanticTokens: ["light", "dark"],
    },
    types: {
      color: "colors",
      typography: "textStyles",
      fontFamilies: "fonts",
    },
    tokensName: {
      fontFamilies: "fonts",
      borderRadius: "radii",
    },
    conditionalTokens: {
      light: "base",
      dark: "_dark",
      desktop: "_desktop",
      mobile: "_mobile",
    },
    replaceTokensValue: ["textCases"],
    ignoreTokens: ["paragraphSpacing"],
    ignoreProperties: [],
    css: {
      textCase: "textTransform",
    },
    extensions: {
      modifier: {
        key: "modify",
        transformer: colorModifier
      }
    },
  },

  panda: {
    tokens: "tokens",
    semanticTokens: "schemas",
    textStyles: "texts"
  }
};
