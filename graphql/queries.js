//queries used in the profile page

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

// ── 2a. Total XP — aggregate sum, not subject to row-return limits ──
export async function fetchXPTotal() {
  const data = await gqlQuery(`{
    transaction_aggregate(
      where: {
        type: { _eq: "xp" }
      }
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
  }`);
  return data.transaction_aggregate.aggregate.sum.amount ?? 0;
}

// ── 2b. XP per project / over time (nested query, for the graphs) ──
export async function fetchXP() {
  const data = await gqlQuery(`{
    transaction(
      where: {
        type: { _eq: "xp" }
      }
      order_by: { createdAt: asc }
      limit: 1000
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