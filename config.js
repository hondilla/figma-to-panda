export const config = {
  tokensPath: "tokens",
  metadataFile: "$metadata.json",
  buildPath: "build",

  mappings: {
    categories: {
      tokens: ["Colors", "Fonts", "Dimensions"],
      semanticTokens: ["Light", "Dark"],
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
      Light: "base",
      Dark: "_dark",
      Desktop: "_desktop",
      Mobile: "_mobile",
    },
    css: {},
  },

  panda: {
    tokens: "tokens",
    semanticTokens: "schemas",
    textStyles: "texts"
  }
};
