export const PASSWORD_POLICY_TEXT = "At least 12 characters with an uppercase letter, a lowercase letter, a number and a special character.";
export function isStrongPassword(value: string) {
  return value.length >= 12 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
}
