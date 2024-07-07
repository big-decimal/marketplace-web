"use client";
import {
  AuthenticationContext,
  AuthenticationState,
  Status
} from "@/common/contexts";
import { UnauthorizeError } from "@/common/customs";
import { getLoginUser } from "@/services/UserService";
import { ReactNode, useCallback, useEffect, useState } from "react";

export const AuthenticationContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const loadUser = async () => {
    try {
      setAuthState((old) => {
        return { ...old, status: "loading" };
      });

      const user = await getLoginUser();

      setAuthState((old) => {
        return {
          ...old,
          status: "success",
          user: { ...user }
        };
      });
    } catch (error) {
      if (error && error instanceof UnauthorizeError) {
        setAuthState((old) => {
          return { ...old, status: "unauthorized", user: undefined };
        });
      } else {
        setAuthState((old) => {
          return { ...old, status: "failure", user: undefined };
        });
      }
    }
  };

  const updateStatus = useCallback((status?: Status) => {
    setAuthState((old) => {
      if (status === "unauthorized") {
        return { ...old, status: status, user: undefined };
      }
      return { ...old, status: status };
    });
  }, []);

  const [authState, setAuthState] = useState<AuthenticationState>({
    status: "loading",
    update: updateStatus,
    reload: loadUser
  });

  useEffect(() => {
    const onStorage = (evt: StorageEvent) => {
      const token = localStorage.getItem("access_token");
      console.log(evt);
      if (evt.key === 'access_token' && !evt.oldValue && evt.newValue) {
        loadUser();
      } else if (!token) {
        setAuthState((old) => {
          return { ...old, status: "unauthorized", user: undefined };
        });
      }
    };
    addEventListener('storage', onStorage);

    if (localStorage.getItem("access_token")) {
      loadUser();
    } else {
      setAuthState((old) => {
        return { ...old, status: "unauthorized", user: undefined };
      });
    }
    return () => {
      removeEventListener('storage', onStorage);
    }
  }, []);

  return (
    <AuthenticationContext.Provider value={authState}>
      {children}
    </AuthenticationContext.Provider>
  );
};
