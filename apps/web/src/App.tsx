import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  createGroup,
  createMarket,
  createPosition,
  getCurrentUser,
  getMarkets,
  joinGroup,
  resolveMarket,
  type CurrentUserResponse,
  type Market
} from "./lib/api";

const tomorrowAtNoon = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(12, 0, 0, 0);
  return date.toISOString().slice(0, 16);
};

export default function App() {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    user,
    getAccessTokenSilently
  } = useAuth0();

  const [token, setToken] = useState("");
  const [profile, setProfile] = useState<CurrentUserResponse | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [closesAt, setClosesAt] = useState(tomorrowAtNoon());
  const [statusMessage, setStatusMessage] = useState("Sign in to load your family markets.");
  const [error, setError] = useState("");

  const selectedGroup = useMemo(
    () => profile?.groups.find((group) => group.id === selectedGroupId) ?? null,
    [profile, selectedGroupId]
  );

  async function refreshProfile(accessToken: string) {
    const nextProfile = await getCurrentUser(accessToken);
    setProfile(nextProfile);
    return nextProfile;
  }

  async function refreshMarkets(accessToken: string, groupId: string) {
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
      } catch (requestError) {
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

  async function handleCreateGroup(event: FormEvent<HTMLFormElement>) {
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
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create group.");
    }
  }

  async function handleJoinGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const response = await joinGroup(token, joinCode);
      await refreshProfile(token);
      setSelectedGroupId(response.groupId);
      setJoinCode("");
      setStatusMessage("Joined family group.");
      await refreshMarkets(token, response.groupId);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to join group.");
    }
  }

  async function handleCreateMarket(event: FormEvent<HTMLFormElement>) {
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
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create market.");
    }
  }

  async function handleTrade(marketId: string, side: "YES" | "NO") {
    setError("");

    try {
      await createPosition(token, marketId, { side, amount: 10 });
      await refreshMarkets(token, selectedGroupId);
      setStatusMessage(`Bought ${side}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Trade failed.");
    }
  }

  async function handleResolve(marketId: string, resolution: boolean) {
    setError("");

    try {
      await resolveMarket(token, marketId, resolution);
      await refreshMarkets(token, selectedGroupId);
      setStatusMessage("Market resolved.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to resolve market.");
    }
  }

  if (isLoading) {
    return <main className="shell"><section className="card">Loading authentication...</section></main>;
  }

  if (!isAuthenticated) {
    return (
      <main className="shell">
        <section className="hero">
          <p className="eyebrow">Private family forecasting</p>
          <h1>Build a market, hide it from the subject.</h1>
          <p className="lede">
            This app lets your family create private prediction markets where the person being discussed never sees the market in their feed.
          </p>
          <button className="primary" onClick={() => void loginWithRedirect()}>
            Sign in with Auth0
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Signed in as</p>
          <h1>{user?.name ?? profile?.user.displayName ?? "Family member"}</h1>
        </div>
        <button
          className="secondary"
          onClick={() =>
            logout({
              logoutParams: {
                returnTo: window.location.origin
              }
            })
          }
        >
          Log out
        </button>
      </section>

      <section className="status-row">
        <span>{statusMessage}</span>
        {error ? <strong>{error}</strong> : null}
      </section>

      <section className="grid">
        <article className="card">
          <h2>Family groups</h2>
          <p className="muted">Create a private pool or join one with a code.</p>
          <form onSubmit={handleCreateGroup} className="stack">
            <input
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="The Parkers"
              required
            />
            <button className="primary" type="submit">Create group</button>
          </form>
          <form onSubmit={handleJoinGroup} className="stack">
            <input
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              placeholder="Join code"
              required
            />
            <button className="secondary" type="submit">Join group</button>
          </form>
          <div className="stack">
            {profile?.groups.map((group) => (
              <button
                key={group.id}
                type="button"
                className={selectedGroupId === group.id ? "group-chip active" : "group-chip"}
                onClick={() => setSelectedGroupId(group.id)}
              >
                <span>{group.name}</span>
                <small>{group.joinCode}</small>
              </button>
            ))}
          </div>
        </article>

        <article className="card">
          <h2>Create hidden market</h2>
          <p className="muted">The chosen family member is excluded at the API layer.</p>
          <form onSubmit={handleCreateMarket} className="stack">
            <select
              value={targetUserId}
              onChange={(event) => setTargetUserId(event.target.value)}
              required
            >
              <option value="">Choose who the market is about</option>
              {selectedGroup?.members
                .filter((member) => member.id !== profile?.user.id)
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.displayName}
                  </option>
                ))}
            </select>
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Will Alex announce a move before Labor Day?"
              required
            />
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Settlement notes, timing, edge cases"
            />
            <label>
              Close time
              <input
                type="datetime-local"
                value={closesAt}
                onChange={(event) => setClosesAt(event.target.value)}
                required
              />
            </label>
            <button className="primary" type="submit" disabled={!selectedGroupId}>
              Publish market
            </button>
          </form>
        </article>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Selected group</p>
            <h2>{selectedGroup?.name ?? "Choose a group"}</h2>
          </div>
          {selectedGroup ? (
            <p className="muted">
              Members: {selectedGroup.members.map((member) => member.displayName).join(", ")}
            </p>
          ) : null}
        </div>

        <div className="market-list">
          {markets.length === 0 ? (
            <div className="empty-state">
              <h3>No visible markets yet.</h3>
              <p>If a market is about you, it is intentionally hidden from this view.</p>
            </div>
          ) : (
            markets.map((market) => (
              <article key={market.id} className="market-card">
                <div className="market-header">
                  <div>
                    <p className="eyebrow">About {market.targetUser.displayName}</p>
                    <h3>{market.question}</h3>
                  </div>
                  <span className={`badge ${market.status.toLowerCase()}`}>{market.status}</span>
                </div>
                {market.description ? <p className="muted">{market.description}</p> : null}
                <div className="market-metrics">
                  <div>
                    <strong>{Math.round(market.summary.yesPrice * 100)}%</strong>
                    <span>YES</span>
                  </div>
                  <div>
                    <strong>{market.summary.totalVolume}</strong>
                    <span>volume</span>
                  </div>
                  <div>
                    <strong>{new Date(market.closesAt).toLocaleString()}</strong>
                    <span>closes</span>
                  </div>
                </div>
                <div className="market-actions">
                  <button className="primary" type="button" onClick={() => void handleTrade(market.id, "YES")}>
                    Buy YES
                  </button>
                  <button className="secondary" type="button" onClick={() => void handleTrade(market.id, "NO")}>
                    Buy NO
                  </button>
                  {selectedGroup?.role === "ADMIN" && market.status !== "RESOLVED" ? (
                    <>
                      <button className="ghost" type="button" onClick={() => void handleResolve(market.id, true)}>
                        Resolve YES
                      </button>
                      <button className="ghost" type="button" onClick={() => void handleResolve(market.id, false)}>
                        Resolve NO
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
