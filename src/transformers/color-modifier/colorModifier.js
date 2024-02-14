import { darken } from "./darken.js";
import { lighten } from "./lighten.js";
import Color from 'colorjs.io';

export default function colorModifier(
  tokens,
  extension,
  currentValue,
  modifier
) {
  const ext = { colors: { modifier: extension } };
  const keysOfModifier = modifier.value
    .replace("{", "")
    .replace("}", "")
    .split(".");
  const valueToApply = keysOfModifier.reduce((acc, key) => acc[key], ext);

  const valueToSearch = currentValue
    .replace("{", "")
    .replace("}", "")
    .split(".");

  if (valueToSearch.length > 1) {
    const colorValue = valueToSearch.reduce(
      (acc, key) => acc[key],
      tokens.tokens
    );

    const base = new Color(colorValue.value)

    if (modifier.type === "darken") {
      return darken(base, modifier.space, valueToApply.value).toString({format: "hex"})
    }
    return lighten(base, modifier.space, valueToApply.value).toString({format: "hex"})
  }

  return currentValue;
}
