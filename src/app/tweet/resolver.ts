import { prismaClient } from "../../client/db";
import { GraphqlContext } from "../user/interfaces";

interface CreateTweetPayload {
  content: string;
  imageURL?: string;
}

const mutation = {
  createTweet: async (
    parent: any,
    { payload }: { payload: CreateTweetPayload },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) throw new Error("You are not authenticated");
    const tweet = await prismaClient.tweet.create({
      data: {
        content: payload.content,
        imageURL: payload.imageURL,
        author: { connect: { id: ctx.user.id } }
      }
    })
    return tweet;
  },

};

export const resolvers = { Mutation: mutation }