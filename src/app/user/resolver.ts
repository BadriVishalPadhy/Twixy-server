import axios from "axios";
import { prismaClient } from "../../client/db";

import JWTService from "../../services/jwt";
import { GraphqlContext } from "./interfaces";
import { User } from "@prisma/client";
interface GoogleAuthToken {
  iss?: string;
  azp?: string;
  aud?: string;
  sub?: string;
  email: string;
  email_verified: string;
  nbf?: string;
  name?: string;
  picture?: string;
  given_name: string;
  family_name?: string;
  iat?: string;
  exp?: string;
  jti?: string;
  alg?: string;
  kid?: string;
  typ?: string;
}


const queries = {
  //token came from client = query VerifyUserGoogleToken($token: String!) 

  verifyGoogletokens: async (parent: any, { token }: { token: string }) => {  //u will give me a user token 
    const googleToken = token;
    const googleOauthURL = new URL('https://oauth2.googleapis.com/tokeninfo')
    googleOauthURL.searchParams.set('id_token', googleToken)

    const { data } = await axios.get<GoogleAuthToken>(googleOauthURL.toString(), { responseType: 'json' }) //will give the data of the user 

    const user = await prismaClient.user.findUnique({    //searches and checks if the user mail exists or not 
      where: { email: data.email }
    })
    // if not exists then create one 
    if (!user) {
      await prismaClient.user.create({
        data: {
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name,
          profileImageURL: data.picture

        }
      })
    }

    //from here i will create a token for the user 
    const userInDb = await prismaClient.user.findUnique({
      where: { email: data.email },
    });

    if (!userInDb) throw new Error("User with this mail not found")

    const userToken = JWTService.generateTokenForUser(userInDb);

    return userToken;


  }
  ,
  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    console.log(ctx);
    const id = ctx.user?.id
    if (!id) return null;


    const user = await prismaClient.user.findUnique({ where: { id } })
    return user;
  }


};
const extraResolvers = {
  User: {
    tweets: (parent: User) => prismaClient.tweet.findMany({ where: { author: { id: parent.id } } })
  },
};


export const resolver = { queries, extraResolvers };
