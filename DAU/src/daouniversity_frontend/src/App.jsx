import React, { useState, useEffect } from "react";
import "./index.scss";
import { Toaster, toast } from "react-hot-toast";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent, Actor } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
// Import your generated backend declarations
//import { idlFactory, canisterId as backendCanisterId } from "../../declarations/daouniversity_backend";
//import { createActor, canisterId } from "../../declarations/daologin";
import { idlFactory, canisterId as backendCanisterId } from "../../declarations/daologin";
// AdminPanel component
const AdminPanel = ({ users, onChangeRole, principalList }) => {
  const [targetPrincipal, setTargetPrincipal] = useState('');
  const [selectedRole, setSelectedRole] = useState('Student');

  const handleAssignRole = () => {
    if (!targetPrincipal) {
      toast.error("Please enter a Principal ID.");
      return;
    }
    onChangeRole(targetPrincipal, selectedRole);
    setTargetPrincipal('');
  };

  return (
    <div className="panel admin-panel">
      <h2>Admin Dashboard</h2>

      <section>
        <h3>Assign User Roles</h3>
        <div className="role-assignment-form">
          <input
            type="text"
            placeholder="Enter User Principal ID (e.g., 2vxsx-fae)"
            value={targetPrincipal}
            onChange={(e) => setTargetPrincipal(e.target.value)}
          />
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="Developer">Select Role</option>
            <option value="Student">Student</option>
            <option value="Professor">Professor</option>
            <option value="Admin">Admin</option>
            <option value="Guest">Guest</option>
          </select>
          <button onClick={handleAssignRole}>Assign Role</button>
        </div>
      </section>

      <section>
        <h3>All Users & Their Roles</h3>
        {users.length > 0 ? (
          <ul>
            {users.map((user) => (
              <li key={user.principal}>
                <strong>{user.principal}</strong> - {user.role}
              </li>
            ))}
          </ul>
        ) : (
          <p>No users found or loaded.</p>
        )}
      </section>

      <section>
        <h3>All Known Principals (for debugging/reference)</h3>
        {principalList.length > 0 ? (
          <ul>
            {principalList.map(p => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        ) : (
          <p>No principals registered yet.</p>
        )}
      </section>
    </div>
  );
};

// Main App Component
export default function App() {
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [actor, setActor] = useState(null);
  const [principalText, setPrincipalText] = useState("");
  const [role, setRole] = useState("Guest"); // Default to Guest

  const [users, setUsers] = useState([]); // For Admin panel
  const [principalList, setPrincipalList] = useState([]); // For Admin panel

  // --- Config from .env ---
  const network = import.meta.env.VITE_DFX_NETWORK || "local";
  const iiCanisterId = import.meta.env.VITE_INTERNET_IDENTITY_CANISTER_ID;

  // --- Helper to create Actor ---
  const makeActor = (ident) => {
    const agent = new HttpAgent({ identity: ident });
    if (network === "local") {
        agent.fetchRootKey().catch(e => {
            console.warn("Unable to fetch root key. Check if dfx is running.", e);
        });
    }
    return Actor.createActor(idlFactory, { agent, canisterId: backendCanisterId });
  };

  // --- Refresh Session: new logic for role assignment ---
  const refreshSession = async (currentActor, intendedRole = null) => {
    if (!currentActor) {
      console.log("No actor provided to refreshSession. Resetting state.");
      setIdentity(null);
      setActor(null);
      setPrincipalText("");
      setRole("Guest");
      setUsers([]);
      setPrincipalList([]);
      return;
    }

    const ident = authClient.getIdentity();
    setIdentity(ident);
    const currentPrincipal = ident.getPrincipal();
    setPrincipalText(currentPrincipal.toText());
    setActor(currentActor); // Store the actor

    let determinedRole = "Guest";

    try {
      if (intendedRole) {
        // Call the new backend function with the intended role
        // Backend expects a Candid variant type, e.g., { 'Admin': null }
        const roleVariant = { [intendedRole]: null };
        const resultRoleRes = await currentActor.login_as_role(roleVariant);
        determinedRole = Object.keys(resultRoleRes)[0];
        toast.success(`Logged in. Your role is: ${determinedRole}`);
      } else {
        // If no intendedRole (e.g., refreshing existing session), just get my_role
        const roleRes = await currentActor.my_role();
        determinedRole = roleRes ? Object.keys(roleRes)[0] : "Guest";
        // No toast here as it's a silent refresh
      }
      setRole(determinedRole);

      // Load Admin-specific data if the user is an Admin
      if (determinedRole === "Admin") {
        const [loadedUsers, loadedPrincipals] = await Promise.all([
          currentActor.list_users(),
          currentActor.list_principals()
        ]);
        setUsers(loadedUsers.map(([p, rr]) => ({
          principal: p.toText(),
          role: Object.keys(rr)[0],
        })));
        setPrincipalList(loadedPrincipals.map(p => p.toText()));
      } else {
        setUsers([]);
        setPrincipalList([]);
      }
    } catch (err) {
      console.error("Error during session refresh/login_as_role:", err);
      toast.error("Failed to confirm role. Please try again.");
      setRole("Guest"); // Fallback
    }
  };

  // --- Initialize AuthClient on component mount ---
  useEffect(() => {
    AuthClient.create().then(client => {
      setAuthClient(client);
      // If already authenticated, get identity and create actor for silent refresh
      if (client.isAuthenticated()) {
        const ident = client.getIdentity();
        const act = makeActor(ident);
        refreshSession(act); // No intended role for silent refresh
      }
    });
  }, []);

  // --- Login function, now taking an intended role string ---
  const login = (intendedRole) => {
    console.log(`🔐 Calling authClient.login for ${intendedRole}…`);
    const identityProviderUrl = network === "local"          
          ? `http://${iiCanisterId}.localhost:4943/#authorize`
          :"https://identity.ic0.app/#authorize";
      // ? 'http://${iiCanisterId}.localhost:4943/?canisterId=${iiCanisterId}'
      // : "https://identity.ic0.app/";

    authClient?.login({
      identityProvider: identityProviderUrl,
      onSuccess: async () => {
        const ident = authClient.getIdentity();
        const act = makeActor(ident);
        await refreshSession(act, intendedRole); // Pass the intended role
      },
      onError: (err) => {
        console.error("Login failed:", err);
        toast.error("Login failed. Please check console for details.");
      },
    });
  };

  // --- Logout function (remains mostly same) ---
  const logout = async () => {
    console.log("🔐 Calling authClient.logout…");
    await authClient?.logout();
    setIdentity(null);
    setActor(null);
    setPrincipalText("");
    setRole("Guest");
    setUsers([]);
    setPrincipalList([]);
    toast.success("Logged out successfully.");
  };

  // --- Admin: Change Role (remains mostly same) ---
  const changeRole = async (principalTxt, newRole) => {
    if (!actor) { toast.error("Actor not initialized. Please log in."); return; }
    if (role !== "Admin") { toast.error("You must be an Admin to assign roles."); return; }

    try {
      const roleVariant = { [newRole]: null };
      await actor.assign_role(Principal.fromText(principalTxt), roleVariant);
      toast.success(`Role updated to ${newRole} for ${principalTxt}`);
      await refreshSession(actor); // Re-fetch all data to show updated roles
    } catch (err) {
      console.error("assign_role failed:", err);
      if (err.message && err.message.includes("Only admins can call this method")) {
          toast.error("Failed to assign role: You are not authorized.");
      } else {
          toast.error(`Failed to assign role: ${err?.message || err}`);
      }
    }
  };

  return (
    <div className="app">
      <Toaster position="top-right" />
      <h1>Role-Based Login DApp</h1>

      <div className="auth-section">
        {!identity ? (
          // Separate Login Buttons based on intended role
          <div className="login-options">
            <p>Login to Daouniversy as:</p>
            <button onClick={() => login('Admin')} className="login-button admin">
              Login as Admin
            </button>
            <button onClick={() => login('Student')} className="login-button student">
              Login as Student
            </button>
            <button onClick={() => login('Professor')} className="login-button professor">
              Login as Professor
            </button>
          </div>
        ) : (
          <>
            <p>
              Logged in as <strong>{principalText}</strong> (<em>Actual Role: {role}</em>)
            </p>
            <button onClick={logout} className="logout-button">Logout</button>
          </>
        )}
      </div>

      {/* Conditional rendering based on actual role */}
      {role === "Admin" && (
        <AdminPanel users={users} onChangeRole={changeRole} principalList={principalList} />
      )}

      {role === "Student" && (
        <div className="panel student-panel">
          <h2>Student Dashboard</h2>
          <p>Welcome, Student! Here you can access student-specific features.</p>
          {/* Add student-specific UI here */}
        </div>
      )}

      {role === "Professor" && (
        <div className="panel instructor-panel">
          <h2>Professor Dashboard</h2>
          <p>Welcome, Professor! Here you can manage your courses and students.</p>
          {/* Add professor-specific UI here */}
        </div>
      )}

      {role === "Guest" && !identity && (
          <div className="panel guest-panel">
            <h2>Welcome!</h2>
            <p>Please select a role to log in. Your actual role will be determined by the system.</p>
          </div>
      )}

      {role === "Guest" && identity && ( // If logged in, but determined as Guest (e.g. they requested admin, but not first)
          <div className="panel guest-panel">
            <h2>Hello, Guest!</h2>
            <p>You are logged in, but currently have the Guest role. An administrator can assign you a specific role (Student, Professor, or Admin).</p>
            <p>Your Principal: {principalText}</p>
          </div>
      )}
    </div>
  );
}
