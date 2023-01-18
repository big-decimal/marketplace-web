import { HubCapsule } from "@aws-amplify/core";
import { Auth, Hub } from "aws-amplify";
import { ReactNode, useEffect, useState } from "react";
import { AuthenticationContext, StateContext } from "./contexts";
import { AuthUser } from "./models";

export const AuthenticationContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const [authUser, setAuthUser] = useState<StateContext<AuthUser>>({
    payload: undefined,
    status: "loading"
  });

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        const attributes = user.attributes;
        // TODO: fetch user

        setAuthUser({
          status: "success",
          payload: {
            id: attributes.sub,
            name: attributes.name,
            phone: attributes.phone_number,
            verified: attributes.phone_number_verified
          }
        });
        console.log(user);
      })
      .catch((error) => {
        console.log(error);
        setAuthUser({
          payload: undefined,
          status: "failure"
        });
      });
  }, []);

  useEffect(() => {
    const applyUser = async (attributes: any) => {
      // TODO: fetch user
      setAuthUser({
        status: "success",
        payload: {
          id: attributes.sub,
          name: attributes.name,
          phone: attributes.phone_number,
          verified: attributes.phone_number_verified
        }
      });
    };
    const listener = (data: HubCapsule) => {
      switch (data.payload.event) {
        case "signIn": {
          //console.log("signed in");
          //console.log(data.payload.data);
          const attributes = data.payload.data.attributes;
          applyUser(attributes);
          break;
        }
        case "autoSignIn": {
          //console.log("auto signed in");
          //console.log(data.payload.data);
          const attributes = data.payload.data.attributes;
          applyUser(attributes);
          break;
        }
        case "signOut":
          // console.log("sign out");
          setAuthUser({
            payload: undefined,
            status: "failure"
          });
          break;
      }
    };

    const cancelAuth = Hub.listen("auth", listener);

    return () => {
      cancelAuth();
    };
  }, []);

  return (
    <AuthenticationContext.Provider value={authUser}>
      {children}
    </AuthenticationContext.Provider>
  );
};
