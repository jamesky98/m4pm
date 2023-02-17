/**
 * @typedef { import("@prisma/client").PrismaClient } Prisma
 */
// apollo server
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageDisabled
} from "apollo-server-core";
import express from "express";
import cors from "cors";
import http from "http";

// file and path
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// graphql and prisma
import { typeDefs as scalarTypeDefs } from "graphql-scalars";
import { PrismaClient } from "@prisma/client";
// graphql-upload
import GraphQLUpload from "../node_modules/graphql-upload/GraphQLUpload.mjs";
import graphqlUploadExpress from "../node_modules/graphql-upload/graphqlUploadExpress.mjs";
import { print } from 'graphql';

// utiles
import { getUserId } from "./utils.js";

// resolvers
import Query from "./resolvers/Query.js";
import Mutation from "./resolvers/Mutation.js";

import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envfile = (process.env.NODE_ENV==='development')?'development.env':'.env'

let myEnv = dotenv.config({
  path: path.resolve(process.cwd(), envfile),
  override: true
});
dotenvExpand.expand(myEnv);

// console.log('env:',process.env);
console.log('envfile:',envfile);
console.log('mode:',process.env.NODE_ENV);
console.log('IP:',process.env.IP);
console.log('DATABASE_URL:',process.env.DATABASE_URL);
console.log("WorkPath: ", __dirname);

const resolvers = {
  Query,
  Mutation,
};

const prisma = new PrismaClient();

const BASIC_LOGGING = {
  requestDidStart(requestContext) {
    console.log("request started");
    console.log(requestContext.request.query);
    console.log(requestContext.request.variables);
    return {
      didEncounterErrors(requestContext) {
          console.log("an error happened in response to query " + requestContext.request.query);
          console.log(requestContext.errors);
      },
      willSendResponse(requestContext) {
        console.log("response sent", requestContext.response);
      }
    };
  },
};

const typeDefs = [
      ...scalarTypeDefs,
      fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf8"),
    ];

async function startApolloServer(typeDefs, resolvers) {
  // console.log("NODE_ENV",process.env.NODE_ENV);
  const app = express();
  const corsOptions = {
    // origin: 'http://10.140.170.*',
    origin: '*',
    methods: 'GET,HEAD,POST,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
  app.use(cors(corsOptions));
  // app.use(cors());
  app.use('/public', express.static(path.join(__dirname, process.env.PUBLIC_PATH)));
  app.use(graphqlUploadExpress());
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      return {
        ...req,
        prisma,
        userId: req && req.headers.authorization ? getUserId(req) : null,
      };
    },
    csrfPrevention: true,
    cache: "bounded",
    plugins: [
      // 紀錄日誌
      // BASIC_LOGGING,
      // 與Express server集成
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // 設定初始頁面為Apollo Sandbox
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      // 取消初始頁面為Apollo Sandbox
      // ApolloServerPluginLandingPageDisabled(),
    ],
    // introspection: false,
    nodeEnv: 'development' // process.env.NODE_ENV // development || production
  });

  await server.start();
  server.applyMiddleware({
    app,
    path: "/",
  });

  await new Promise(resolve => httpServer.listen({ port: process.env.PORT }, resolve));
  console.log(`🚀 Server ready at http://${process.env.IP}:${process.env.PORT}${server.graphqlPath}`);

}

startApolloServer(typeDefs,resolvers);
