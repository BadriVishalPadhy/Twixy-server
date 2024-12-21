import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import express from "express";
import bodyParser from "body-parser";
import { prismaClient } from "../client/db";
import { User } from "./user/index";
import cors from "cors";
import { GraphqlContext } from "./user/interfaces";
import JWTService from "../services/jwt";
import { Tweet } from "./tweet/index";
export async function initServer() {
  const app = express();

  app.use(cors());

  app.use(bodyParser.json());
  const graphqlServer = new ApolloServer<GraphqlContext>({
    typeDefs: `
    ${User.types}
    ${Tweet.types} 

    type Query {
   ${User.queries}
    }
   type Mutation {
   ${Tweet.Mutation}
   }
    `,
    resolvers: {
      Query: {
        ...User.resolver.queries,
      },
      Mutation: {
        ...Tweet.resolvers.Mutation,
      }
    },
  });

  await graphqlServer.start();
  app.use(
    "/graphql",
    expressMiddleware(graphqlServer, {
      context: async ({ req, res }) => {
        return {
          user: req.headers.authorization
            ? JWTService.decodeToken(
              req.headers.authorization.split("Bearer ")[1]
            )
            : undefined,
        };
      },
    })
  );

  return app;
}