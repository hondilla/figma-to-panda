import util from "node:util";

const tokens = (key, content) => {
  return `import { defineTokens } from '@pandacss/dev'
    
export const ${key} = defineTokens.${key}(${util.inspect(content, {
    compact: false,
    depth: 20,
  })})\n`;
};

const semanticTokens = (key, content) => {
  return `import { defineSemanticTokens } from '@pandacss/dev'

export const ${key} = defineSemanticTokens.${key}(${util.inspect(content, {
    compact: false,
    depth: 20,
  })})\n`;
};

const textStyles = (key, content) => {
  return `import { defineTextStyles } from '@pandacss/dev'
  
export const ${key} = defineTextStyles(${util.inspect(content, {
    compact: false,
    depth: 20,
  })})\n`;
};

export const templates = {
  tokens,
  semanticTokens,
  textStyles,
};
