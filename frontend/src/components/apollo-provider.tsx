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

function makeClient() {
    const httpLink = new HttpLink({
        uri: "http://localhost:8080/graphql",
    });

    return new NextSSRApolloClient({
        cache: new NextSSRInMemoryCache(),
        link:
            typeof window === "undefined"
                ? ApolloLink.from([
                    new SSRMultipartLink({
                        stripDefer: true,
                    }),
                    httpLink,
                ])
                : httpLink,
    });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
    return (
        <ApolloNextAppProvider makeClient={makeClient}>
            <AuthProvider>{children}</AuthProvider>
        </ApolloNextAppProvider>
    );
}
