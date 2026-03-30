import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { createGroup, createMarket, createPosition, getCurrentUser, getMarkets, joinGroup, resolveMarket } from "./lib/api";
const tomorrowAtNoon = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(12, 0, 0, 0);
    return date.toISOString().slice(0, 16);
};
export default function App() {
    const { isAuthenticated, isLoading, loginWithRedirect, logout, user, getAccessTokenSilently } = useAuth0();
    const [token, setToken] = useState("");
    const [profile, setProfile] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [markets, setMarkets] = useState([]);
    const [groupName, setGroupName] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [question, setQuestion] = useState("");
    const [description, setDescription] = useState("");
    const [targetUserId, setTargetUserId] = useState("");
    const [closesAt, setClosesAt] = useState(tomorrowAtNoon());
    const [statusMessage, setStatusMessage] = useState("Sign in to load your family markets.");
    const [error, setError] = useState("");
    const selectedGroup = useMemo(() => profile?.groups.find((group) => group.id === selectedGroupId) ?? null, [profile, selectedGroupId]);
    async function refreshProfile(accessToken) {
        const nextProfile = await getCurrentUser(accessToken);
        setProfile(nextProfile);
        return nextProfile;
    }
    async function refreshMarkets(accessToken, groupId) {
        const nextMarkets = await getMarkets(accessToken, groupId);
        setMarkets(nextMarkets);
    }
    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }
        let active = true;
        void (async () => {
            try {
                const accessToken = await getAccessTokenSilently();
                if (!active) {
                    return;
                }
                setToken(accessToken);
                const nextProfile = await refreshProfile(accessToken);
                const initialGroupId = nextProfile.groups[0]?.id ?? "";
                setSelectedGroupId(initialGroupId);
                if (initialGroupId) {
                    await refreshMarkets(accessToken, initialGroupId);
                }
                setStatusMessage("Your hidden family markets are up to date.");
            }
            catch (requestError) {
                if (!active) {
                    return;
                }
                setError(requestError instanceof Error ? requestError.message : "Failed to load app data.");
            }
        })();
        return () => {
            active = false;
        };
    }, [getAccessTokenSilently, isAuthenticated]);
    useEffect(() => {
        if (!token || !selectedGroupId) {
            return;
        }
        void refreshMarkets(token, selectedGroupId).catch((requestError) => {
            setError(requestError instanceof Error ? requestError.message : "Failed to load markets.");
        });
    }, [selectedGroupId, token]);
    async function handleCreateGroup(event) {
        event.preventDefault();
        setError("");
        try {
            const group = await createGroup(token, groupName);
            const nextProfile = await refreshProfile(token);
            setSelectedGroupId(group.id);
            setGroupName("");
            setStatusMessage(`Created ${group.name}.`);
            await refreshMarkets(token, group.id);
            setProfile(nextProfile);
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to create group.");
        }
    }
    async function handleJoinGroup(event) {
        event.preventDefault();
        setError("");
        try {
            const response = await joinGroup(token, joinCode);
            await refreshProfile(token);
            setSelectedGroupId(response.groupId);
            setJoinCode("");
            setStatusMessage("Joined family group.");
            await refreshMarkets(token, response.groupId);
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to join group.");
        }
    }
    async function handleCreateMarket(event) {
        event.preventDefault();
        setError("");
        try {
            await createMarket(token, {
                groupId: selectedGroupId,
                targetUserId,
                question,
                description,
                closesAt: new Date(closesAt).toISOString()
            });
            await refreshMarkets(token, selectedGroupId);
            setQuestion("");
            setDescription("");
            setTargetUserId("");
            setClosesAt(tomorrowAtNoon());
            setStatusMessage("Market created.");
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to create market.");
        }
    }
    async function handleTrade(marketId, side) {
        setError("");
        try {
            await createPosition(token, marketId, { side, amount: 10 });
            await refreshMarkets(token, selectedGroupId);
            setStatusMessage(`Bought ${side}.`);
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Trade failed.");
        }
    }
    async function handleResolve(marketId, resolution) {
        setError("");
        try {
            await resolveMarket(token, marketId, resolution);
            await refreshMarkets(token, selectedGroupId);
            setStatusMessage("Market resolved.");
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to resolve market.");
        }
    }
    if (isLoading) {
        return _jsx("main", { className: "shell", children: _jsx("section", { className: "card", children: "Loading authentication..." }) });
    }
    if (!isAuthenticated) {
        return (_jsx("main", { className: "shell", children: _jsxs("section", { className: "hero", children: [_jsx("p", { className: "eyebrow", children: "Private family forecasting" }), _jsx("h1", { children: "Build a market, hide it from the subject." }), _jsx("p", { className: "lede", children: "This app lets your family create private prediction markets where the person being discussed never sees the market in their feed." }), _jsx("button", { className: "primary", onClick: () => void loginWithRedirect(), children: "Sign in with Auth0" })] }) }));
    }
    return (_jsxs("main", { className: "shell", children: [_jsxs("section", { className: "topbar", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Signed in as" }), _jsx("h1", { children: user?.name ?? profile?.user.displayName ?? "Family member" })] }), _jsx("button", { className: "secondary", onClick: () => logout({
                            logoutParams: {
                                returnTo: window.location.origin
                            }
                        }), children: "Log out" })] }), _jsxs("section", { className: "status-row", children: [_jsx("span", { children: statusMessage }), error ? _jsx("strong", { children: error }) : null] }), _jsxs("section", { className: "grid", children: [_jsxs("article", { className: "card", children: [_jsx("h2", { children: "Family groups" }), _jsx("p", { className: "muted", children: "Create a private pool or join one with a code." }), _jsxs("form", { onSubmit: handleCreateGroup, className: "stack", children: [_jsx("input", { value: groupName, onChange: (event) => setGroupName(event.target.value), placeholder: "The Parkers", required: true }), _jsx("button", { className: "primary", type: "submit", children: "Create group" })] }), _jsxs("form", { onSubmit: handleJoinGroup, className: "stack", children: [_jsx("input", { value: joinCode, onChange: (event) => setJoinCode(event.target.value.toUpperCase()), placeholder: "Join code", required: true }), _jsx("button", { className: "secondary", type: "submit", children: "Join group" })] }), _jsx("div", { className: "stack", children: profile?.groups.map((group) => (_jsxs("button", { type: "button", className: selectedGroupId === group.id ? "group-chip active" : "group-chip", onClick: () => setSelectedGroupId(group.id), children: [_jsx("span", { children: group.name }), _jsx("small", { children: group.joinCode })] }, group.id))) })] }), _jsxs("article", { className: "card", children: [_jsx("h2", { children: "Create hidden market" }), _jsx("p", { className: "muted", children: "The chosen family member is excluded at the API layer." }), _jsxs("form", { onSubmit: handleCreateMarket, className: "stack", children: [_jsxs("select", { value: targetUserId, onChange: (event) => setTargetUserId(event.target.value), required: true, children: [_jsx("option", { value: "", children: "Choose who the market is about" }), selectedGroup?.members
                                                .filter((member) => member.id !== profile?.user.id)
                                                .map((member) => (_jsx("option", { value: member.id, children: member.displayName }, member.id)))] }), _jsx("input", { value: question, onChange: (event) => setQuestion(event.target.value), placeholder: "Will Alex announce a move before Labor Day?", required: true }), _jsx("textarea", { rows: 4, value: description, onChange: (event) => setDescription(event.target.value), placeholder: "Settlement notes, timing, edge cases" }), _jsxs("label", { children: ["Close time", _jsx("input", { type: "datetime-local", value: closesAt, onChange: (event) => setClosesAt(event.target.value), required: true })] }), _jsx("button", { className: "primary", type: "submit", disabled: !selectedGroupId, children: "Publish market" })] })] })] }), _jsxs("section", { className: "card", children: [_jsxs("div", { className: "section-heading", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Selected group" }), _jsx("h2", { children: selectedGroup?.name ?? "Choose a group" })] }), selectedGroup ? (_jsxs("p", { className: "muted", children: ["Members: ", selectedGroup.members.map((member) => member.displayName).join(", ")] })) : null] }), _jsx("div", { className: "market-list", children: markets.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("h3", { children: "No visible markets yet." }), _jsx("p", { children: "If a market is about you, it is intentionally hidden from this view." })] })) : (markets.map((market) => (_jsxs("article", { className: "market-card", children: [_jsxs("div", { className: "market-header", children: [_jsxs("div", { children: [_jsxs("p", { className: "eyebrow", children: ["About ", market.targetUser.displayName] }), _jsx("h3", { children: market.question })] }), _jsx("span", { className: `badge ${market.status.toLowerCase()}`, children: market.status })] }), market.description ? _jsx("p", { className: "muted", children: market.description }) : null, _jsxs("div", { className: "market-metrics", children: [_jsxs("div", { children: [_jsxs("strong", { children: [Math.round(market.summary.yesPrice * 100), "%"] }), _jsx("span", { children: "YES" })] }), _jsxs("div", { children: [_jsx("strong", { children: market.summary.totalVolume }), _jsx("span", { children: "volume" })] }), _jsxs("div", { children: [_jsx("strong", { children: new Date(market.closesAt).toLocaleString() }), _jsx("span", { children: "closes" })] })] }), _jsxs("div", { className: "market-actions", children: [_jsx("button", { className: "primary", type: "button", onClick: () => void handleTrade(market.id, "YES"), children: "Buy YES" }), _jsx("button", { className: "secondary", type: "button", onClick: () => void handleTrade(market.id, "NO"), children: "Buy NO" }), selectedGroup?.role === "ADMIN" && market.status !== "RESOLVED" ? (_jsxs(_Fragment, { children: [_jsx("button", { className: "ghost", type: "button", onClick: () => void handleResolve(market.id, true), children: "Resolve YES" }), _jsx("button", { className: "ghost", type: "button", onClick: () => void handleResolve(market.id, false), children: "Resolve NO" })] })) : null] })] }, market.id)))) })] })] }));
}
