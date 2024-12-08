const queries = {
  verifyGoogletokens: async (parent: any, { token }: { token: string }) => {
    return token;
  }
}

export const resolver = { queries };
