// graphql/queries.js
// All named queries used in the profile page
 
import { gqlQuery } from './client.js';
 
// ── 1. Basic user info (normal query) ──
export async function fetchUser() {
  const data = await gqlQuery(`{
    user {
      id
      login
    }
  }`);
  return data.user[0];
}
 
// ── 2. Total XP + XP per project (nested query) ──
export async function fetchXP() {
  const data = await gqlQuery(`{
    transaction(
      where: {
        type: { _eq: "xp" }
        path: { _nlike: "%piscine%" }
      }
      order_by: { createdAt: asc }
    ) {
      amount
      createdAt
      object {
        name
      }
    }
  }`);
  return data.transaction;
}
 
// ── 3. Audit ratio (argument query) ──
export async function fetchAuditRatio() {
  const data = await gqlQuery(`{
    user {
      auditRatio
      totalUp
      totalDown
    }
  }`);
  return data.user[0];
}
 
// ── 4. Pass / Fail results (nested query) ──
export async function fetchResults() {
  const data = await gqlQuery(`{
    result(
      where: { type: { _eq: "project" } }
      order_by: { createdAt: desc }
    ) {
      grade
      object {
        name
      }
    }
  }`);
  return data.result;
}