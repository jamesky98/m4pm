/**
 * @typedef { import("@prisma/client").PrismaClient } Prisma
 */
import { chkUserId } from "../utils.js";
/**
 * @param {any} parent
 * @param {{ prisma: Prisma }} context
 */
async function m4case(parent, args, context) {
  if(!parent.parent_id){return null}
  const result = await context.prisma.m4case.findUnique({
    where:{ id: parseInt(parent.parent_id) },
  });
  return result;
}

/**
 * @param {any} parent
 * @param {{ prisma: Prisma }} context
 */
async function other_m4case(parent, args, context) {
  const result = await context.prisma.m4case.findMany({
    where:{ parent_id: parseInt(parent.id) },
  });
  return result;
}

export default {
  m4case,
  other_m4case,
};
