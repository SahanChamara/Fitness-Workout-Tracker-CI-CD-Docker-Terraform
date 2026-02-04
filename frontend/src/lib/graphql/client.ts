import { HttpLink, ApolloLink } from "@/lib/apollo-hooks";
import {
  NextSSRInMemoryCache,
  NextSSRApolloClient,
} from "@apollo/experimental-nextjs-app-support/ssr";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// Auth link to add token to headers
const authLink = setContext((_, { headers }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Error link to handle authentication errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Check if it's an authentication error
      if (
        err.extensions?.code === "UNAUTHENTICATED" ||
        err.message.includes("Unauthorized") ||
        err.message.includes("Invalid token")
      ) {
        // Trigger token refresh
        if (typeof window !== "undefined") {
          const event = new CustomEvent("auth:token-expired");
          window.dispatchEvent(event);
        }
      }
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8080/graphql",
  fetchOptions: { cache: "no-store" },
});

export const { getClient } = registerApolloClient(() => {
  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache(),
    link: ApolloLink.from([errorLink, authLink, httpLink]),
  });
});
