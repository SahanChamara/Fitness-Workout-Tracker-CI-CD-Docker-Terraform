"use client";

import { HttpLink } from "@/lib/apollo-hooks";
import {
    ApolloNextAppProvider,
    NextSSRApolloClient,
    NextSSRInMemoryCache,
    SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support/ssr";
import { ApolloLink } from "@/lib/apollo-hooks";
import { AuthProvider } from "@/context/auth-context";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

function makeClient() {
    const httpLink = new HttpLink({
        uri: "http://localhost:8080/graphql",
    });

    const authLink = setContext((_, { headers }) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        return {
            headers: {
                ...headers,
                authorization: token ? `Bearer ${token}` : "",
            },
        };
    });

    const errorLink = onError(({ graphQLErrors }) => {
        if (!graphQLErrors || typeof window === "undefined") {
            return;
        }

        for (const err of graphQLErrors) {
            if (
                err.extensions?.code === "UNAUTHENTICATED" ||
                err.message.includes("Unauthorized") ||
                err.message.includes("Invalid token")
            ) {
                window.dispatchEvent(new CustomEvent("auth:token-expired"));
            }
        }
    });

    return new NextSSRApolloClient({
        cache: new NextSSRInMemoryCache(),
        link:
            typeof window === "undefined"
                ? ApolloLink.from([
                    new SSRMultipartLink({
                        stripDefer: true,
                    }),
                    errorLink,
                    authLink,
                    httpLink,
                ])
                : ApolloLink.from([errorLink, authLink, httpLink]),
    });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
    return (
        <ApolloNextAppProvider makeClient={makeClient}>
            <AuthProvider>{children}</AuthProvider>
        </ApolloNextAppProvider>
    );
}
