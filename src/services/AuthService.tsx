import { CognitoUser } from "amazon-cognito-identity-js";
import { Auth } from "aws-amplify";

export async function login({
  username,
  password
}: {
  username: string;
  password: string;
}) {
  try {
    const user = await Auth.signIn({
      username: username,
      password: password
    });
    console.log(user);
    return user as CognitoUser;
  } catch (error) {
    throw error;
  }
}

export async function signUp({
  name,
  phone,
  password
}: {
  name: string;
  phone: string;
  password: string;
}) {
  try {
    const result = await Auth.signUp({
      username: phone,
      password: password,
      attributes: {
        name: name,
        phone_number: phone // optional - E.164 number convention
      },
      autoSignIn: {
        // optional - enables auto sign in after user is confirmed
        enabled: process.env.NEXT_PUBLIC_PROFILE !== "dev"
      }
    });
    console.log(result);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function confirmSignUp({
  phone,
  password,
  code
}: {
  phone: string;
  password: string;
  code: string;
}) {
  try {
    await Auth.confirmSignUp(phone, code, { forceAliasCreation: false });
  } catch (error) {
    throw error;
  }
}
