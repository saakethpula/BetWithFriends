import { REFERRAL_PARAM_KEYS } from "../constants/app";
const JOIN_CODE_PATTERN = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6,12}$/;
const REFERRAL_JOIN_CODE_STORAGE_KEY = "family-market-referral-join-code";
function normalizeJoinCode(value) {
    const joinCode = value?.trim().toUpperCase() ?? "";
    return JOIN_CODE_PATTERN.test(joinCode) ? joinCode : "";
}
export function getReferralJoinCodeFromUrl() {
    if (typeof window === "undefined") {
        return "";
    }
    const searchParams = new URLSearchParams(window.location.search);
    for (const key of REFERRAL_PARAM_KEYS) {
        const value = normalizeJoinCode(searchParams.get(key));
        if (value) {
            return value;
        }
    }
    return "";
}
export function getSavedReferralJoinCode() {
    if (typeof window === "undefined") {
        return "";
    }
    const value = normalizeJoinCode(window.localStorage.getItem(REFERRAL_JOIN_CODE_STORAGE_KEY));
    if (!value) {
        window.localStorage.removeItem(REFERRAL_JOIN_CODE_STORAGE_KEY);
    }
    return value;
}
export function saveReferralJoinCode(joinCode) {
    if (typeof window === "undefined") {
        return;
    }
    const value = normalizeJoinCode(joinCode);
    if (!value) {
        return;
    }
    window.localStorage.setItem(REFERRAL_JOIN_CODE_STORAGE_KEY, value);
}
export function saveReferralJoinCodeFromUrl() {
    saveReferralJoinCode(getReferralJoinCodeFromUrl());
}
export function clearSavedReferralJoinCode() {
    if (typeof window === "undefined") {
        return;
    }
    window.localStorage.removeItem(REFERRAL_JOIN_CODE_STORAGE_KEY);
}
export function clearReferralJoinCodeFromUrl() {
    if (typeof window === "undefined") {
        return;
    }
    const nextUrl = new URL(window.location.href);
    for (const key of REFERRAL_PARAM_KEYS) {
        nextUrl.searchParams.delete(key);
    }
    window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
}
export function buildGroupInviteUrl(joinCode) {
    if (typeof window === "undefined") {
        return "";
    }
    const inviteUrl = new URL(window.location.origin + window.location.pathname);
    inviteUrl.searchParams.set("groupCode", joinCode);
    return inviteUrl.toString();
}
